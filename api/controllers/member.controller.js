const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

exports.getMembers = async (req, res, next) => {
  try {
    const users = await prisma.member.findMany({
      include: {
        membership: true,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Successfully get members data",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        status: false,
        message: "Missing required field",
        data: null,
      });
    }

    const member = await prisma.member.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Successfully create member data",
      data: {
        member,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: {
        id,
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
    return res.status(201).json({
      status: true,
      message: "Successfully get member data",
      data: {
        member,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: {
        id,
      },
    });
    if (!member) {
      return res.status(404).json({
        status: false,
        message: "Member not found",
        data: null,
      });
    }

    const deleteMember = await prisma.member.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Successfully delete member data",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
