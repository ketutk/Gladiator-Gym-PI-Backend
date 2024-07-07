const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendVerifyEmail } = require("../libs/nodemailer");
const { generateRandomString } = require("../libs/randomString");
const { JWT_SECRET } = process.env;

// function login
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Terdapat beberapa field kosong",
        data: null,
      });
    }

    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Akun tidak ditemukan",
        data: null,
      });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: false,
        message: "Password salah",
        data: null,
      });
    }
    delete user.password;

    let token = jwt.sign(user, JWT_SECRET);
    return res.status(200).json({
      status: true,
      message: "User berhasil login",
      data: { ...user, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { token } = req.body;
    let data;
    try {
      data = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: "Token tidak valid. Proses registrasi gagal",
        data: null,
      });
    }
    const { name, email, password, address, phone, ktp_id } = data;

    if (!name || !email || !password || !address || !phone || !ktp_id) {
      return res.status(400).json({
        status: false,
        message: "Terdapat beberapa field kosong",
        data: null,
      });
    }

    const [duplicateMail, duplicatePhone, duplicateId] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: email,
        },
      }),
      prisma.profile.findUnique({
        where: {
          phone: phone,
        },
      }),
      prisma.profile.findUnique({
        where: {
          ktp_id: ktp_id,
        },
      }),
    ]);

    if (duplicateMail) {
      return res.status(409).json({
        status: false,
        message: "Email sudah digunakan",
        data: null,
      });
    }
    if (duplicatePhone) {
      return res.status(409).json({
        status: false,
        message: "Nomor telepon sudah digunakan",
        data: null,
      });
    }
    if (duplicateId) {
      return res.status(409).json({
        status: false,
        message: "NIK atau Nomor KTP sudah digunakan",
        data: null,
      });
    }

    let encryptedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: encryptedPassword,
        profile: {
          create: {
            address,
            phone,
            ktp_id,
          },
        },
      },
      include: true,
    });

    delete user.password;

    return res.status(201).json({
      status: true,
      message: "Proses registrasi berhasil. Anda bisa login dengan akun anda.",
      data: {
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.sendVerifyAdmin = async (req, res, next) => {
  try {
    const { name, email, address, phone, ktp_id } = req.body;

    if (!name || !email || !address || !phone || !ktp_id) {
      return res.status(400).json({
        status: false,
        message: "Terdapat beberapa field kosong",
        data: null,
      });
    }

    const [duplicateMail, duplicatePhone, duplicateId] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: email,
        },
      }),
      prisma.profile.findUnique({
        where: {
          phone: phone,
        },
      }),
      prisma.profile.findUnique({
        where: {
          ktp_id: ktp_id,
        },
      }),
    ]);

    if (duplicateMail) {
      return res.status(409).json({
        status: false,
        message: "Email sudah digunakan",
        data: null,
      });
    }
    if (duplicatePhone) {
      return res.status(409).json({
        status: false,
        message: "Nomor telepon sudah digunakan",
        data: null,
      });
    }
    if (duplicateId) {
      return res.status(409).json({
        status: false,
        message: "NIK atau Nomor KTP sudah digunakan",
        data: null,
      });
    }
    const password = generateRandomString();

    const data = { name, email, password, address, phone, ktp_id };

    const token = jwt.sign(data, JWT_SECRET, {
      expiresIn: "15m",
    });

    await sendVerifyEmail(data, token);

    return res.status(200).json({
      status: true,
      message: "Email berhasil terkirim. Silahkan cek email untuk melanjutkan proses registrasi.",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.whoami = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user_data.id,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Akun tidak ditemukan",
        data: null,
      });
    }

    delete user.password;

    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({
        status: false,
        message: "Terdapat beberapa field kosong.",
        data: null,
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.user_data.id,
      },
      data: {
        name,
        profile: {
          update: {
            phone,
            address,
          },
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Berhasil memperbarui profil",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Terdapat beberapa field kosong.",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: {
        id: req.user_data.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Berhasil memperbarui password",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
        role: "ADMIN",
      },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Akun tidak ditemukan",
        data: null,
      });
    }

    await prisma.user.delete({
      where: {
        id,
        role: "ADMIN",
      },
    });

    return res.status(200).json({
      status: true,
      message: "Berhasil menghapus data",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    // Extract query parameters, with default values of page=1 and pageSize=10
    const { page = 1, s: search = "" } = req.query;
    const pageSize = 10;

    // Calculate the number of items to skip based on the current page
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    let where = {};
    if (search !== "") {
      where = {
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
            profile: {
              phone: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      };
    }

    const user = await prisma.user.findMany({
      skip: skip,
      take: parseInt(pageSize),
      where: {
        role: "ADMIN",
        ...where,
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get the total number of items for pagination purposes
    const totalItems = await prisma.user.count({
      where: {
        role: "ADMIN",
        ...where,
      },
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    return res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data admin",
      data: {
        user,
        page: parseInt(page),
        total_page: totalPages,
        total_items: totalItems,
      },
    });

    // return res.status(200).json({
    //   status: true,
    //   message: "Successfully get user data.",
    //   data: {
    //     user,
    //   },
    // });
  } catch (error) {
    next(error);
  }
};
