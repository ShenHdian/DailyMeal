import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import type { Food } from "~/types/food";

interface FoodDialogProps {
  open: boolean;
  editingFood: Food | null;
  defaultType: "whitelist" | "blacklist";
  onClose: () => void;
  onSave: (name: string, type: "whitelist" | "blacklist") => Promise<void>;
}

export default function FoodDialog({
  open,
  editingFood,
  defaultType,
  onClose,
  onSave,
}: FoodDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"whitelist" | "blacklist">(defaultType);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editingFood?.name ?? "");
      setType(editingFood?.type ?? defaultType);
    }
  }, [open, editingFood, defaultType]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("请输入食品名称");
      return;
    }
    setSaving(true);
    try {
      await onSave(name.trim(), type);
      toast.success(editingFood ? "已更新 ✅" : "已添加 ✅");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!editingFood;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑食品" : "添加食品"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">食品名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入食品名称"
              maxLength={30}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>类型</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("whitelist")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border",
                  type === "whitelist"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                )}
              >
                ✅ 白名单
              </button>
              <button
                type="button"
                onClick={() => setType("blacklist")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border",
                  type === "blacklist"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                )}
              >
                ❌ 黑名单
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "保存中..." : isEdit ? "更新" : "添加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}