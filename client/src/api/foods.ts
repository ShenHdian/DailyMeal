import type { Food } from "~/types/food";

const API_BASE = "/api";

export async function fetchFoods(type?: "whitelist" | "blacklist"): Promise<Food[]> {
  const params = type ? `?type=${type}` : "";
  const res = await fetch(`${API_BASE}/foods${params}`);
  if (!res.ok) throw new Error("获取食品列表失败");
  return res.json();
}

export async function addFood(name: string, type: "whitelist" | "blacklist"): Promise<Food> {
  const res = await fetch(`${API_BASE}/foods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "添加失败");
  }
  return res.json();
}

export async function updateFood(id: string, name: string, type?: "whitelist" | "blacklist"): Promise<Food> {
  const res = await fetch(`${API_BASE}/foods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "更新失败");
  }
  return res.json();
}

export async function deleteFood(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/foods/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "删除失败");
  }
}

export async function getRandomFood(): Promise<Food> {
  const res = await fetch(`${API_BASE}/foods/random`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "白名单还没有食品");
  }
  return res.json();
}

export async function fetchHistory(): Promise<{ id: string; foodName: string; createdAt: string }[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error("获取历史失败");
  return res.json();
}

export async function addHistoryRecord(foodName: string): Promise<{ id: string; foodName: string; createdAt: string }[]> {
  const res = await fetch(`${API_BASE}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foodName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "记录失败");
  }
  return res.json();
}
