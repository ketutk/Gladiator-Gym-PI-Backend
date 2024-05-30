const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

// function login
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Missing required field",
        data: null,
      });
    }

    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Account not found.",
        data: null,
      });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: false,
        message: "Invalid password.",
        data: null,
      });
    }
    delete user.password;

    let token = jwt.sign(user, JWT_SECRET);
    return res.status(200).json({
      status: true,
      message: "User logged in success",
      data: { ...user, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, address, phone, ktp_id } = req.body;

    if (!name || !email || !password || !address || !phone || !ktp_id) {
      return res.status(400).json({
        status: false,
        message: "Missing required field",
        data: null,
      });
    }

    const duplicate = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        status: false,
        message: "Email already used",
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
      message: "Successfully created account",
      data: {
        user: user,
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
        message: "Account not found.",
        data: null,
      });
    }

    delete user.password;

    return res.status(200).json({
      status: true,
      message: "Success get data",
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
        message: "Missing required field.",
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
      message: "Successfully update profile.",
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
        message: "Missing required field.",
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
      message: "Successfully change password.",
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
      },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Account not found.",
        data: null,
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Successfully delete user",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const user = await prisma.user.findMany({});

    return res.status(200).json({
      status: true,
      message: "Successfully get user data.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
