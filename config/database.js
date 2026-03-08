const { ENV_CONFIG } = require("./envConfig");

const config = {
  local: {
    username: process.env.DB_USER || "your_username",
    password: process.env.DB_PASSWORD || "your_password",
    database: process.env.DB_NAME || "your_database_name",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    dialect: "postgres",
  },

  development: {
    username: ENV_CONFIG.DATABASE_CONFIG.USER,
    password: ENV_CONFIG.DATABASE_CONFIG.PASSWORD,
    database: ENV_CONFIG.DATABASE_CONFIG.DB_NAME,
    host: ENV_CONFIG.DATABASE_CONFIG.HOST,
    port: ENV_CONFIG.DATABASE_CONFIG.PORT,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

module.exports = config;
