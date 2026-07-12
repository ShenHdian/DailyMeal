import { useState, useEffect, useCallback } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import {
  fetchCalendar,
  fetchComments,
  addComment,
  deleteComment,
  type Comment,
  type CalendarData,
} from "~/api/comments";

function getBizDate() {
  const now = new Date();
  const cst = new Date(now.getTime() + 8 * 3600000);
  const d = new Date(cst);
  if (d.getHours() < 12) d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  return { firstDay, daysInMonth };
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function CalendarJournal() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [expanded, setExpanded] = useState(false);

  const bizDate = getBizDate();
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const { firstDay, daysInMonth } = getMonthDays(year, month);

  const loadCalendar = useCallback(async () => {
    try {
      const data = await fetchCalendar(monthKey);
      setCalendarData(data);
    } catch {
      // ignore
    }
  }, [monthKey]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const loadComments = useCallback(async (date: string) => {
    try {
      const data = await fetchComments(date);
      setComments(data);
    } catch {
      setComments([]);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadComments(selectedDate);
      setExpanded(false);
    }
  }, [selectedDate, loadComments]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment(commentText.trim());
      setCommentText("");
      toast.success("评论已添加");
      if (selectedDate) loadComments(selectedDate);
      loadCalendar();
    } catch (e: any) {
      toast.error(e.message || "添加评论失败");
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id);
      toast.success("评论已删除");
      if (selectedDate) loadComments(selectedDate);
      loadCalendar();
    } catch {
      toast.error("删除失败");
    }
  };

  const isToday = (date: string) => date === bizDate;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">📅 饮食日历</h3>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          ◀ 上月
        </Button>
        <span className="text-sm font-medium">{year}年{month}月</span>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          下月 ▶
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-16" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${monthKey}-${String(day).padStart(2, "0")}`;
          const dayData = calendarData[dateStr];
          const hasFoods = dayData && dayData.foods.length > 0;
          const commentCount = dayData?.commentCount || 0;
          const selected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(dateStr)}
              className={cn(
                "h-16 rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer",
                selected && "bg-accent ring-2 ring-ring",
                !selected && isToday(dateStr) && "bg-muted",
                !selected && !isToday(dateStr) && "hover:bg-muted"
              )}
            >
              <span className={cn("font-medium", isToday(dateStr) ? "text-primary" : "text-foreground")}>
                {day}
              </span>
              {hasFoods && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {dayData!.foods.slice(0, 2).map((f, fi) => (
                    <span key={fi} className="text-[10px] truncate max-w-[40px]">{f}</span>
                  ))}
                  {dayData!.foods.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayData!.foods.length - 2}</span>}
                </div>
              )}
              {commentCount > 0 && (
                <span className="text-[10px] text-blue-400">💬{commentCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {selectedDate} {isToday(selectedDate) ? "(今天)" : ""}
            </span>
          </div>

          {calendarData[selectedDate]?.foods.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {calendarData[selectedDate].foods.map((f, fi) => (
                <Badge key={fi} variant="secondary" className="text-xs">
                  🍽️ {f}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {comments.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto space-y-1.5">
                {(expanded ? comments : comments.slice(0, 5)).map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-2 py-1">
                    <span className="text-xs text-foreground">{c.content}</span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      删除
                    </Button>
                  </div>
                ))}
                {comments.length > 5 && !expanded && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="text-xs text-primary hover:text-primary/80 cursor-pointer"
                  >
                    查看全部 {comments.length} 条评论
                  </button>
                )}
              </div>
            )}

            {isToday(selectedDate) && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="写条评论..."
                  className="text-xs h-8"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                />
                <Button onClick={handleAddComment} size="sm" className="h-8">
                  发送
                </Button>
              </div>
            )}

            {!isToday(selectedDate) && comments.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">这一天暂无记录</p>
            )}

            {!isToday(selectedDate) && (
              <p className="text-xs text-muted-foreground mt-1">🔒 仅当天可评论</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}