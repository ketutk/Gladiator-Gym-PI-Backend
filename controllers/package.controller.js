const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

exports.getPackages = async (req, res, next) => {
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

    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data paket",
      data: {
        packages,
      },
    });
  } catch (error) {
    next(error);
  }
};
