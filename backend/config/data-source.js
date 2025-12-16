const { DataSource } = require("typeorm");
require("dotenv").config();

const AppDataSource = new DataSource({
    type: "sqlite",
    database: "media.db",
    synchronize: true, // Auto-create tables (dev only)
    logging: false,
    entities: [require("../entity/Media")],
    migrations: [],
    subscribers: [],
});

module.exports = AppDataSource;
