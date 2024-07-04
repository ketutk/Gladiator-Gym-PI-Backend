const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { checkMembership } = require("../libs/checkMembership");
const { JWT_SECRET } = process.env;

exports.getMembers = async (req, res, next) => {
  try {
    // Extract query parameters, with default values of page=1 and pageSize=10
    const { page = 1, status, name } = req.query;
    const pageSize = 10;

    // Calculate the number of items to skip based on the current page
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const whereClause = {};
    if (name) {
      whereClause.OR = [
        {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: name,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: name,
            mode: "insensitive",
          },
        },
      ];
    }
    if (status) {
      whereClause.membership = {
        status: status === "true",
      };
    }

    // Fetch the items from the database using Prisma, applying pagination
    const member = await prisma.member.findMany({
      where: whereClause,
      skip: skip,
      take: parseInt(pageSize),
      include: {
        membership: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let members = [];

    for (const item of member) {
      let member = item;
      if (!item?.membership?.active_until || item?.membership?.status == false) {
        members.push(member);
        continue;
      }
      try {
        const response = await checkMembership(item);
        if (response) {
          member.membership = response;
        }
        members.push(member);
      } catch (error) {
        throw error;
      }
    }

    // Get the total number of items for pagination purposes
    const totalItems = await prisma.member.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data member",
      data: {
        members,
        page: parseInt(page),
        total_page: totalPages,
        total_items: totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllMember = async (req, res, next) => {
  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });
    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan semua data member",
      data: {
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({
        status: false,
        message: "Terdapat beberapa field kosong",
        data: null,
      });
    }
    const or = [];

    if (phone !== "") {
      or.push({
        phone,
      });
    }
    if (email !== "") {
      or.push({
        email,
      });
    }

    const isExist = await prisma.member.findMany({
      where: {
        OR: or,
      },
    });

    if (isExist.length !== 0) {
      return res.status(400).json({
        status: false,
        message: "Email atau Telepon telah digunakan",
        data: isExist,
      });
    }

    const member = await prisma.member.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address,
        membership: {
          create: {},
        },
      },
      include: {
        membership: true,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Berhasil membuat data member",
      data: {
        member,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMemberByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const member = await prisma.member.findUnique({
      where: {
        email: email,
      },
      include: {
        membership: true,
      },
    });

    if (!member) {
      return res.status(404).json({
        status: false,
        message: "Member tidak ditemukan",
        data: null,
      });
    }
    let memberData = member;

    if (member?.membership?.active_until && member?.membership?.status == true) {
      try {
        const response = await checkMembership(memberData);
        if (response) {
          memberData.membership = response;
        }
      } catch (error) {
        throw error;
      }
    }

    return res.status(201).json({
      status: true,
      message: "Berhasil mendapatkan data member",
      data: {
        member: memberData,
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
      include: {
        membership: true,
      },
    });
    if (!member) {
      return res.status(404).json({
        status: false,
        message: "Member tidak ditemukan",
        data: null,
      });
    }

    if (member.membership.status) {
      return res.status(400).json({
        status: false,
        message: "Member merupakan member aktif dan tidak dapat dihapus",
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
      message: "Berhasil menghapus data member",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        status: false,
        message: "Terdapat beberapa field kosong",
        data: null,
      });
    }

    const member = await prisma.member.findUnique({
      where: {
        id,
      },
    });

    if (!member) {
      return res.status(404).json({
        status: false,
        message: "Member tidak ditemukan",
        data: null,
      });
    }

    await prisma.member.update({
      where: {
        id,
      },
      data: {
        name,
        phone,
        address,
      },
    });
    return res.status(200).json({
      status: true,
      message: "Berhasil memperbarui data member",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
