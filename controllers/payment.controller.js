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
    const { member_id, package_id, payment_method } = req.body;

    if (!member_id || !package_id || !payment_method) {
      return res.status(400).json({
        status: false,
        message: "Missing required field",
        data: null,
      });
    }

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

    const addDays = addMembershipsDays(member?.membership?.active_until, package.days_add);

    const [upsertMembership, createPayment] = await prisma.$transaction([
      prisma.membership.update({
        where: {
          member_id: member_id,
        },
        data: {
          active_until: addDays,
          status: true,
        },
      }),
      prisma.payments.create({
        data: {
          member_id: member_id,
          package_id: package.id,
          staff_id: req.user_data.id,
          payment_method: payment_method,
          total_payments: package.price,
        },
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Successfully create payments data",
      data: {
        payment: createPayment,
        membership: upsertMembership,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    // Extract query parameters, with default values of page=1 and pageSize=10
    const { page = 1, s: search = "", from, to, pm: payment_method } = req.query;
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
    if (payment_method) {
      whereClause.payment_method = payment_method;
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
exports.getAllPayments = async (req, res, next) => {
  try {
    // Extract query parameters, with default values of page=1 and pageSize=10
    const { from, to } = req.query;

    const whereClause = {};

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

    let data = payments.map((item) => {
      return {
        member_name: item.member.name,
        member_email: item.member.email,
        member_phone: item.member.phone,
        staff_name: item.staff.name,
        staff_email: item.staff.email,
        package: item.package.name,
        total_payments: item.total_payments,
        payment_method: item.payment_method,
        payment_date: new Date(item.createdAt).toLocaleString(),
      };
    });

    // Get the total number of items for pagination purposes
    const totalItems = await prisma.payments.count({
      where: whereClause,
    });

    return res.status(200).json({
      status: true,
      message: "Successfully get payments data",
      data: {
        data,
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
    const { email } = req.params;
    // Extract query parameters, with default values of page=1 and pageSize=10
    const { page = 1 } = req.query;
    const pageSize = 10;

    // Calculate the number of items to skip based on the current page
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const payments = await prisma.payments.findMany({
      skip: skip,
      take: pageSize,
      where: {
        member: {
          email: email,
        },
      },
      include: {
        staff: true,
        package: true,
        member: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get the total number of items for pagination purposes
    const totalItems = await prisma.payments.count({
      where: {
        member: {
          email: email,
        },
      },
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    return res.status(200).json({
      status: true,
      message: "Successfully get member payments data",
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
