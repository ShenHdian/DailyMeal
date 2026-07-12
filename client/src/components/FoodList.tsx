import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { Food } from "~/types/food";

const FOOD_EMOJIS = [
  "\u{1F34E}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F349}", "\u{1F347}", "\u{1F353}", "\u{1FAD0}",
  "\u{1F35D}", "\u{1F966}", "\u{1F955}", "\u{1F33D}", "\u{1F95A}", "\u{1F9C0}", "\u{1F969}", "\u{1F357}",
];

interface FoodListProps {
  foods: Food[];
  type: "whitelist" | "blacklist";
  loading: boolean;
  onEdit: (food: Food) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function FoodList({ foods, type, loading, onEdit, onDelete, onAdd }: FoodListProps) {
  const isWhite = type === "whitelist";

  if (!loading && foods.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <div className="text-4xl mb-2">{isWhite ? "\u2705" : "\u274C"}</div>
        <p className="text-sm">{isWhite ? "\u767D\u540D\u5355\u8FD8\u6CA1\u6709\u98DF\u54C1" : "\u9ED1\u540D\u5355\u8FD8\u6CA1\u6709\u98DF\u54C1"}</p>
        <Button variant="default" size="sm" onClick={onAdd} className="mt-3">
          {"\u6DFB\u52A0"}{isWhite ? "\u767D\u540D\u5355" : "\u9ED1\u540D\u5355"}{"\u98DF\u54C1"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {foods.map((food, idx) => (
        <Card key={food.id} size="sm" className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{FOOD_EMOJIS[idx % FOOD_EMOJIS.length]}</span>
              <span className="text-sm font-medium">{food.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={isWhite ? "secondary" : "outline"} className={cn("text-xs", !isWhite && "text-destructive border-destructive/30")}>
                {isWhite ? "\u63A8\u8350" : "\u907F\u514D"}
              </Badge>
              <Button variant="ghost" size="xs" onClick={() => onEdit(food)}>
                {"\u7F16\u8F91"}
              </Button>
              <Button variant="ghost" size="xs" onClick={() => onDelete(food.id)} className="text-destructive hover:text-destructive">
                {"\u5220\u9664"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
