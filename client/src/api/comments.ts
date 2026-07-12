const API_BASE = "/api";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

export async function fetchComments(date: string): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/comments?date=${date}`);
  if (!res.ok) throw new Error("获取评论失败");
  return res.json();
}

export async function fetchCommentDays(month: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/comments?month=${month}`);
  if (!res.ok) throw new Error("获取评论日期失败");
  return res.json();
}

export async function addComment(content: string): Promise<Comment> {
  const res = await fetch(`${API_BASE}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "添加评论失败");
  }
  return res.json();
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/comments/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "删除评论失败");
  }
}

export interface CalendarData {
  [date: string]: {
    foods: string[];
    commentCount: number;
  };
}

export async function fetchCalendar(month: string): Promise<CalendarData> {
  const res = await fetch(`${API_BASE}/calendar?month=${month}`);
  if (!res.ok) throw new Error("获取日历数据失败");
  return res.json();
}
