const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function UserSeeder() {
  return new Promise(async (resolve, reject) => {
    let data = [
      {
        name: "SuperAdmin",
        email: "superadmin@admin.com",
        password: await bcrypt.hash("admin123", 10),
        role: "SUPERADMIN",
        profile: {
          create: {
            address: "BONANG",
            phone: "081348269789",
            ktp_id: "320006798976578",
          },
        },
      },
      {
        name: "Admin",
        email: "admin@admin.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        profile: {
          create: {
            address: "BONANG",
            phone: "081348269256",
            ktp_id: "320006798586978",
          },
        },
      },
    ];
    try {
      const deleteUser = await prisma.user.deleteMany({});

      for (item of data) {
        await prisma.user.create({
          data: item,
          include: {
            profile: true,
          },
        });
      }
      resolve("Success create user seeds");
    } catch (error) {
      reject(error.message);
    }
  });
}

module.exports = UserSeeder;
