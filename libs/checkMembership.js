const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.checkMembership = async (member) => {
  try {
    const now = Date.now();
    const active_until = new Date(member?.membership?.active_until);
    if (now > active_until) {
      const membership = await prisma.membership.update({
        where: {
          member_id: member?.id,
        },
        data: {
          status: false,
        },
      });
      return membership;
    }
    return null;
  } catch (error) {
    throw error;
  }
};
