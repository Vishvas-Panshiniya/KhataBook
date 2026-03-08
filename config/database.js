import { ENV_CONFIG } from "@config/envConfig";

const config = {
  development: {
    username: ENV_CONFIG.DATABASE_CONFIG.USER,
    password: ENV_CONFIG.DATABASE_CONFIG.PASSWORD,
    database: ENV_CONFIG.DATABASE_CONFIG.DB_NAME,
    host: ENV_CONFIG.DATABASE_CONFIG.HOST,
    port: ENV_CONFIG.DATABASE_CONFIG.PORT,
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
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

export default config;
