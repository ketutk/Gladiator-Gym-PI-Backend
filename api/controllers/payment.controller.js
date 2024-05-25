const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { addMembershipsDays } = require("../libs/date-fns");
const { JWT_SECRET } = process.env;

exports.getPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payments.findMany({
      include: {
        member: true,
        staff: true,
        package: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "Successfully get payments data",
      data: {
        payments,
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

    const addDays = addMembershipsDays(member?.membership?.active_until, package.days_add);

    const [upsertMembership, createPayment] = await prisma.$transaction([
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
      prisma.payments.create({
        data: {
          staff_id: req.user_data.id,
          member_id: member.id,
          package_id: package.id,
        },
      }),
    ]);

    return res.status(201).json({
      status: true,
      message: "Successfully create payments data",
      data: {
        payments: createPayment,
        membership: upsertMembership,
      },
    });
  } catch (error) {
    next(error);
  }
};
