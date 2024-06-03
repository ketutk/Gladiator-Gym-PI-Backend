const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getMember = async (req, res, next) => {
  try {
    const members = await prisma.member.count({});

    return res.status(200).json({
      status: true,
      message: "Successfully get member data",
      data: {
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getActiveMember = async (req, res, next) => {
  try {
    const members = await prisma.member.count({
      where: {
        membership: {
          status: true,
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Successfully get active member data",
      data: {
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.payments.count({});

    return res.status(200).json({
      status: true,
      message: "Successfully get transactions data",
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTotalTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.payments.aggregate({
      _sum: {
        total_payments: true,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Successfully get transactions data",
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionsByPakcage = async (req, res, next) => {
  try {
    const packages = await prisma.packages.findMany({
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    const transactions = [];

    for (item of packages) {
      const total_payments = await prisma.payments.aggregate({
        where: {
          package_id: item.id,
        },
        _sum: {
          total_payments: true,
        },
      });
      transactions.push({
        ...item,
        total_payments: total_payments._sum.total_payments,
      });
    }
    // const transactions = await prisma.payments.aggregate({
    //   _sum: {
    //     total_payments: true,
    //   },
    // });

    return res.status(200).json({
      status: true,
      message: "Successfully get transactions data",
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
