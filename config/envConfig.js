require("dotenv").config();

const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || "local",
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_CONFIG: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: Number(process.env.DB_PORT) || 5432,
    USER: process.env.DB_USER || "",
    PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "",
  },
  JWT_SECRET: process.env.JWT_SECRET || "jwt_secret",
  SESSION_SECRET: process.env.SESSION_SECRET || "session_secret",
};

module.exports = { ENV_CONFIG };
