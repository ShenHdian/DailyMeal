import { useState, useRef, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { toast } from "sonner";
import type { Food } from "~/types/food";

interface RandomPickerProps {
  whiteList: Food[];
  onPick: () => Promise<Food>;
}

type Status = "idle" | "rolling" | "result";

export default function RandomPicker({ whiteList, onPick }: RandomPickerProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [currentName, setCurrentName] = useState("");
  const [resultName, setResultName] = useState("");
  const timerRef = useRef<number | null>(null);
  const countRef = useRef(0);

  const roll = useCallback(() => {
    if (whiteList.length === 0) {
      toast.error("白名单还没有食品，请先添加");
      return;
    }

    setStatus("rolling");
    setResultName("");
    countRef.current = 0;

    const names = whiteList.map((f) => f.name);
    const maxSteps = 20;

    timerRef.current = window.setInterval(() => {
      countRef.current++;
      setCurrentName(names[Math.floor(Math.random() * names.length)]);

      if (countRef.current >= maxSteps) {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onPick()
          .then((food) => {
            setResultName(food.name);
            setCurrentName(food.name);
            setStatus("result");
          })
          .catch((err) => {
            toast.error(err.message || "获取推荐失败");
            setStatus("idle");
          });
      }
    }, 80);
  }, [whiteList, onPick]);

  return (
    <div className="text-center">
      {status === "idle" && (
        <div>
          <p className="text-muted-foreground text-sm mb-3">点击按钮，从白名单中随机推荐一个食品</p>
          <Button
            onClick={roll}
            disabled={whiteList.length === 0}
            className="px-8 py-2 rounded-xl text-base font-medium"
          >
            🎲 随机推荐
          </Button>
          {whiteList.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">请先添加白名单食品</p>
          )}
        </div>
      )}

      {status === "rolling" && (
        <div>
          <div className="text-5xl font-bold text-primary mb-3 transition-all animate-pulse">
            {currentName || "?"}
          </div>
          <p className="text-muted-foreground text-xs">随机选取中...</p>
        </div>
      )}

      {status === "result" && (
        <div>
          <Card className="bg-accent/30 border-primary/20 mx-auto max-w-xs">
            <CardContent className="p-4">
              <div className="text-3xl mb-1">🍽️</div>
              <div className="text-xl font-bold text-primary">{resultName}</div>
              <p className="text-xs text-muted-foreground mt-1">今天就吃这个吧！</p>
            </CardContent>
          </Card>
          <Button onClick={roll} variant="outline" className="mt-3">
            🎲 再摇一次
          </Button>
        </div>
      )}
    </div>
  );
}