const { Client } = require('pg');

const client = new Client({
  host: "192.168.10.13",
  port: 5432,
  user: "signage_user",
  password: "Password##123",
  database: "signage",
});

client.connect()
  .then(() => {
    console.log("✅ DB Connected");
    return client.end();
  })
  .catch(err => {
    console.error("❌ DB Error:", err.message);
  });
