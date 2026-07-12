const path = require("path");
const DB_PATH = path.join(__dirname, "data.db");

const knex = require("knex")({
  client: "better-sqlite3",
  connection: { filename: DB_PATH },
  useNullAsDefault: true,
});

async function initDB() {
  const hasFoods = await knex.schema.hasTable("foods");
  if (!hasFoods) {
    await knex.schema.createTable("foods", (t) => {
      t.string("id").primary();
      t.string("name").notNullable();
      t.string("type", 10).notNullable().index(); // "whitelist" | "blacklist"
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
    console.log("Created table: foods");
  }

  const hasHistory = await knex.schema.hasTable("history");
  if (!hasHistory) {
    await knex.schema.createTable("history", (t) => {
      t.increments("id").primary();
      t.string("food_name").notNullable();
      t.string("date", 10).notNullable().index(); // YYYY-MM-DD
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
    console.log("Created table: history");
  }

  const hasComments = await knex.schema.hasTable("comments");
  if (!hasComments) {
    await knex.schema.createTable("comments", (t) => {
      t.increments("id").primary();
      t.text("content").notNullable();
      t.string("date", 10).notNullable().index();
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
    console.log("Created table: comments");
  }
}

function getBizDate() {
  const now = new Date();
  const cst = new Date(now.getTime() + 8 * 3600000);
  const d = new Date(cst);
  if (d.getHours() < 12) {
    d.setDate(d.getDate() - 1);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

module.exports = { knex, initDB, getBizDate };
