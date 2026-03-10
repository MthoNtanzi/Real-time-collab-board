require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");
const pool = require("./index");

const migrationsDir = path.join(__dirname, "migrations");

async function runMigrations() {
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
        if (!file.endsWith(".sql")) continue;
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        console.log(`Running migration: ${file}`);
        await pool.query(sql);
        console.log(`✓ ${file}`);
    }

    console.log("All migrations complete.");
    await pool.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});