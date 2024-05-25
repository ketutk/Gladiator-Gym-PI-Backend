const { PrismaClient } = require("@prisma/client");
const UserSeeder = require("./user-seed");
const PackageSeed = require("./payments-seed");
const prisma = new PrismaClient();

async function main() {
  const createUser = await UserSeeder();
  const createPackage = await PackageSeed();

  console.log(createUser);
  console.log(createPackage);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
