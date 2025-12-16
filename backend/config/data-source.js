const { DataSource } = require("typeorm");
require("dotenv").config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "media_db",
    synchronize: true, // Auto-create tables (dev only)
    logging: false,
    entities: [require("../entity/Media")],
    migrations: [],
    subscribers: [],
});

module.exports = AppDataSource;
