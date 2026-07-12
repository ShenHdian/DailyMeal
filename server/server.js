const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { knex, initDB, getBizDate } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;
const clientDist = path.join(__dirname, "..", "client", "dist");

app.use(cors());
app.use(express.json());

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

initDB().catch((e) => console.error("DB init error:", e));

// ─── Foods API ──────────────────────────────────────────────

// GET /api/foods?type=whitelist|blacklist — 获取食品列表
app.get("/api/foods", async (req, res) => {
  const { type } = req.query;
  let query = knex("foods").orderBy("created_at", "desc");
  if (type && ["whitelist", "blacklist"].includes(type)) {
    query = query.where({ type });
  }
  const rows = await query;
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    createdAt: r.created_at,
  })));
});

// POST /api/foods — 添加食品
app.post("/api/foods", async (req, res) => {
  const { name, type } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "食品名称不能为空" });
  if (!type || !["whitelist", "blacklist"].includes(type)) {
    return res.status(400).json({ error: "类型必须是 whitelist 或 blacklist" });
  }
  const newFood = {
    id: uuidv4(),
    name: name.trim(),
    type,
    created_at: new Date().toISOString(),
  };
  await knex("foods").insert(newFood);
  res.status(201).json({
    id: newFood.id,
    name: newFood.name,
    type: newFood.type,
    createdAt: newFood.created_at,
  });
});

// PUT /api/foods/:id — 编辑食品
app.put("/api/foods/:id", async (req, res) => {
  const { name, type } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "食品名称不能为空" });
  const existing = await knex("foods").where({ id: req.params.id }).first();
  if (!existing) return res.status(404).json({ error: "食品不存在" });

  const updateData = { name: name.trim() };
  if (type && ["whitelist", "blacklist"].includes(type)) {
    updateData.type = type;
  }

  await knex("foods").where({ id: req.params.id }).update(updateData);
  const updated = await knex("foods").where({ id: req.params.id }).first();
  res.json({
    id: updated.id,
    name: updated.name,
    type: updated.type,
    createdAt: updated.created_at,
  });
});

// DELETE /api/foods/:id — 删除食品
app.delete("/api/foods/:id", async (req, res) => {
  const existing = await knex("foods").where({ id: req.params.id }).first();
  if (!existing) return res.status(404).json({ error: "食品不存在" });
  await knex("foods").where({ id: req.params.id }).del();
  res.json({ success: true });
});

// GET /api/foods/random — 从白名单随机选取
app.get("/api/foods/random", async (req, res) => {
  const rows = await knex("foods").where({ type: "whitelist" });
  if (rows.length === 0) return res.status(404).json({ error: "白名单还没有食品，请先添加" });
  const pick = rows[Math.floor(Math.random() * rows.length)];
  res.json({
    id: pick.id,
    name: pick.name,
    type: pick.type,
    createdAt: pick.created_at,
  });
});

// ─── History API ─────────────────────────────────────────

app.get("/api/history", async (req, res) => {
  const rows = await knex("history")
    .where({ date: getBizDate() })
    .orderBy("created_at", "desc")
    .limit(3);
  res.json(rows.map((r) => ({ id: String(r.id), foodName: r.food_name, createdAt: r.created_at })));
});

app.post("/api/history", async (req, res) => {
  const { foodName } = req.body;
  if (!foodName || !foodName.trim()) return res.status(400).json({ error: "食品名称不能为空" });
  const bizDate = getBizDate();
  await knex("history").insert({
    food_name: foodName.trim(),
    date: bizDate,
    created_at: new Date().toISOString(),
  });

  const rows = await knex("history").where({ date: bizDate }).orderBy("created_at", "asc");
  if (rows.length > 3) {
    const idsToDelete = rows.slice(0, rows.length - 3).map((r) => r.id);
    await knex("history").whereIn("id", idsToDelete).del();
  }

  const recent = await knex("history")
    .where({ date: bizDate })
    .orderBy("created_at", "desc")
    .limit(3);
  res.status(201).json(recent.map((r) => ({ id: String(r.id), foodName: r.food_name, createdAt: r.created_at })));
});

// ─── Calendar API ────────────────────────────────────────

app.get("/api/calendar", async (req, res) => {
  const { month } = req.query;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "参数格式错误，请使用 YYYY-MM" });
  }
  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const result = {};
  for (let d = 1; d <= daysInMonth; d++) {
    result[`${month}-${String(d).padStart(2, "0")}`] = { foods: [], commentCount: 0 };
  }

  const startDate = `${month}-01`;
  const endDate = `${month}-${String(daysInMonth).padStart(2, "0")}`;
  const historyRows = await knex("history")
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .orderBy("created_at", "desc");

  historyRows.forEach((r) => {
    if (result[r.date] && result[r.date].foods.length < 3) {
      result[r.date].foods.push(r.food_name);
    }
  });

  const commentRows = await knex("comments")
    .where("date", ">=", startDate)
    .where("date", "<=", endDate);

  commentRows.forEach((r) => {
    if (result[r.date]) {
      result[r.date].commentCount++;
    }
  });

  res.json(result);
});

// ─── Comments API ─────────────────────────────────────────

app.post("/api/comments", async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: "评论内容不能为空" });
  await knex("comments").insert({
    content: content.trim(),
    date: getBizDate(),
    created_at: new Date().toISOString(),
  });
  const record = await knex("comments").orderBy("created_at", "desc").first();
  res.status(201).json({
    id: String(record.id),
    content: record.content,
    createdAt: record.created_at,
  });
});

app.get("/api/comments", async (req, res) => {
  const { date, month } = req.query;
  if (month) {
    const rows = await knex("comments")
      .where("date", "like", `${month}%`)
      .select(knex.raw("DISTINCT substr(date, 9, 2) as day"));
    const days = rows.map((r) => String(parseInt(r.day))).filter(Boolean).sort((a, b) => a - b);
    return res.json(days);
  }
  if (date) {
    const rows = await knex("comments")
      .where({ date })
      .orderBy("created_at", "asc");
    return res.json(
      rows.map((r) => ({ id: String(r.id), content: r.content, createdAt: r.created_at }))
    );
  }
  const rows = await knex("comments").orderBy("created_at", "desc");
  const grouped = {};
  rows.forEach((r) => {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push({ id: String(r.id), content: r.content, createdAt: r.created_at });
  });
  const sorted = Object.keys(grouped).sort().reverse().slice(0, 3);
  const result = {};
  sorted.forEach((d) => {
    result[d] = grouped[d].reverse();
  });
  res.json(result);
});

app.delete("/api/comments/:id", async (req, res) => {
  await knex("comments").where({ id: parseInt(req.params.id) }).del();
  res.json({ success: true });
});

// ─── Health ──────────────────────────────────────────────

app.get("/api/health", async (req, res) => {
  const whitelistCount = await knex("foods").where({ type: "whitelist" }).count("id as c").first();
  const blacklistCount = await knex("foods").where({ type: "blacklist" }).count("id as c").first();
  res.json({
    status: "ok",
    whitelistCount: whitelistCount?.c || 0,
    blacklistCount: blacklistCount?.c || 0,
  });
});

// ─── SPA fallback ───────────────────────────────────────

app.get("*", (req, res) => {
  const indexPath = path.join(clientDist, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🥗 Dailymeal 后端服务已启动: http://localhost:${PORT}`);
});
