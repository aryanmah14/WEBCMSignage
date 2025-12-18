const { Client } = require('pg');
require('dotenv').config();

// Use environment variables or fallback to the ones found in db-test.js
const config = {
    host: process.env.DB_HOST || "192.168.10.13",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "signage_user",
    password: process.env.DB_PASSWORD || "Password##123",
    database: process.env.DB_NAME || "signage",
};

const client = new Client(config);

async function cleanup() {
    try {
        await client.connect();
        console.log("✅ Connected to Database");

        const query = "DELETE FROM media WHERE url = 'https://via.placeholder.com/150'";
        const res = await client.query(query);

        console.log(`✅ Cleaned up ${res.rowCount} mock records.`);
    } catch (err) {
        console.error("❌ Cleanup Error:", err.message);
    } finally {
        await client.end();
    }
}

cleanup();
