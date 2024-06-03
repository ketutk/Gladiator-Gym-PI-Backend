const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { addMembershipsDays } = require("../libs/date-fns");
const midtransClient = require("midtrans-client");
const { generateRandomString } = require("../libs/randomString");
const { default: axios } = require("axios");
const { response } = require("express");
const { JWT_SECRET } = process.env;

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.SERVER_KEY,
  clientKey: process.env.CLIENT_KEY,
});

exports.createPayment = async (req, res, next) => {
  try {
    const { member_id, package_id } = req.body;

    const member = await prisma.member.findUnique({
      where: {
        id: member_id,
      },
      include: {
        membership: true,
      },
    });

    if (!member) {
      return res.status(404).json({
        status: false,
        message: "Member not found",
        data: null,
      });
    }
    const package = await prisma.packages.findUnique({
      where: {
        id: package_id,
      },
    });

    if (!package) {
      return res.status(404).json({
        status: false,
        message: "Package not found",
        data: null,
      });
    }

    const authString = btoa(`${process.env.SERVER_KEY}`);
    const dataTransaction = {
      transaction_details: {
        order_id: `GLADIATOR-${Date.now()}-${member_id.split("-")[0]}`,
        gross_amount: package.price,
      },
      item_details: [
        {
          id: package.id,
          price: package.price,
          quantity: 1,
          name: package.name,
        },
      ],
      customer_details: {
        first_name: member.name,
        email: member.email,
        phone: member.phone,
      },
    };

    const responseMidtrans = await axios.post(`${process.env.MIDTRANS_APP_URL}`, JSON.stringify(dataTransaction), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
    });
    const payment = await prisma.payments.create({
      data: {
        order_id: dataTransaction.transaction_details.order_id,
        staff_id: req.user_data.id,
        member_id: member.id,
        package_id: package.id,
        total_payments: package.price,
        status: "pending",
        url_redirect: responseMidtrans.data.redirect_url,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Successfully create payments data",
      data: {
        payment,
        response: responseMidtrans.data,
      },
    });
  } catch (error) {
    if (error.response) {
      // Log detailed error response from Midtrans without causing circular reference issues
      console.error("Error response from Midtrans:", {
        status: error.response.status,
        data: error.response.data,
      });
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      console.error("Axios error:", error.message);
    }
    next(error);
  }
};

exports.notification = async (req, res, next) => {
  try {
    let response;
    coreApi.transaction.notification(req.body).then(async (status) => {
      if (status.transaction_status == "settlement") {
        console.log(req.body);
        console.log(status);
        const payment = await prisma.payments.findUnique({
          where: {
            order_id: req.body.order_id,
          },
        });

        const member = await prisma.member.findUnique({
          where: {
            id: payment.member_id,
          },
        });

        const package = await prisma.packages.findUnique({
          where: {
            id: payment.package_id,
          },
        });

        const addDays = addMembershipsDays(member?.membership?.active_until, package.days_add);

        const [upsertMembership, updatePayment] = await prisma.$transaction([
          prisma.membership.upsert({
            where: {
              member_id: member.id,
            },
            update: {
              status: true,
              active_until: addDays,
            },
            create: {
              member_id: member.id,
              status: true,
              active_until: addDays,
            },
          }),
          prisma.payments.update({
            where: {
              order_id: req.body.order_id,
            },
            data: {
              status: req.body.transaction_status,
            },
          }),
        ]);
        response = {
          member: upsertMembership,
          payment: updatePayment,
        };
      } else if (status.transaction_status == "expire") {
        response = await prisma.payments.update({
          where: {
            order_id: req.body.order_id,
          },
          data: {
            status: req.body.transaction_status,
          },
        });
      }
      return res.status(200).json({
        status: true,
        message: "Successfully update payment",
        data: {
          response,
        },
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    // Extract query parameters, with default values of page=1 and pageSize=10
    const { page = 1, s: search = "", from, to } = req.query;
    const pageSize = 10;

    // Calculate the number of items to skip based on the current page
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const whereClause = {};

    if (search !== "") {
      whereClause.member = {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      };
    }
    if (from) {
      const startOfDay = new Date(from);
      startOfDay.setHours(0, 0, 0, 0);
      whereClause.createdAt = {
        gte: startOfDay,
      };
    }
    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: endOfDay,
      };
    }

    const payments = await prisma.payments.findMany({
      skip: skip,
      take: parseInt(pageSize),
      where: {
        ...whereClause,
      },
      include: {
        member: true,
        staff: true,
        package: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // Get the total number of items for pagination purposes
    const totalItems = await prisma.payments.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalItems / pageSize);

    return res.status(200).json({
      status: true,
      message: "Successfully get payments data",
      data: {
        payments,
        page: parseInt(page),
        total_page: totalPages,
        total_items: totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payments = await prisma.payments.findUnique({
      where: {
        id: id,
      },
      include: {
        member: true,
        staff: true,
        package: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!payments) {
      return res.status(404).json({
        status: false,
        message: "Payments not found",
        data: null,
      });
    }
    return res.status(200).json({
      status: true,
      message: "Successfully get member payments data",
      data: {
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getPaymentsMember = async (req, res, next) => {
  try {
    const { member_id } = req.params;
    const payments = await prisma.payments.findMany({
      where: {
        member_id: member_id,
      },
      include: {
        staff: true,
        package: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!payments) {
      return res.status(404).json({
        status: false,
        message: "Payments not found",
        data: null,
      });
    }
    return res.status(200).json({
      status: true,
      message: "Successfully get member payments data",
      data: {
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};
