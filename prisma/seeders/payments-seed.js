const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function PackageSeed() {
  return new Promise(async (resolve, reject) => {
    let data = [
      {
        name: "1 Bulan Membership",
        price: 200000,
        days_add: 30,
      },
      {
        name: "3 Bulan Membership",
        price: 600000,
        days_add: 90,
      },
      {
        name: "1 Tahun Membership",
        price: 2000000,
        days_add: 365,
      },
    ];
    try {
      const deletePackage = await prisma.packages.deleteMany({});

      const createPackage = await prisma.packages.createMany({
        data: data,
      });
      resolve("Success create package seeds");
    } catch (error) {
      reject(error.message);
    }
  });
}

module.exports = PackageSeed;
