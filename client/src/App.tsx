import { useState, useEffect, useCallback } from "react";
import { Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import FoodList from "./components/FoodList";
import FoodDialog from "./components/FoodDialog";
import RandomPicker from "./components/RandomPicker";
import CalendarJournal from "./components/CalendarJournal";
import type { Food } from "./types/food";
import { fetchFoods, addFood, updateFood, deleteFood, addHistoryRecord, getRandomFood } from "./api/foods";

export default function App() {
  const [whiteList, setWhiteList] = useState<Food[]>([]);
  const [blackList, setBlackList] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("whitelist");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"whitelist" | "blacklist">("whitelist");
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    try {
      const [white, black] = await Promise.all([
        fetchFoods("whitelist"),
        fetchFoods("blacklist"),
      ]);
      setWhiteList(white);
      setBlackList(black);
    } catch (e) {
      console.error("加载食品失败", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const handleAdd = (type: "whitelist" | "blacklist") => {
    setEditingFood(null);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setDialogType(food.type);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingFood(null);
  };

  const handleSave = async (name: string, type: "whitelist" | "blacklist") => {
    if (editingFood) {
      await updateFood(editingFood.id, name, type);
    } else {
      await addFood(name, type);
    }
    await loadFoods();
  };

  const handleDelete = async (id: string) => {
    await deleteFood(id);
    await loadFoods();
  };

  const handleRandomPick = async (): Promise<Food> => {
    const food = await getRandomFood();
    await addHistoryRecord(food.name);
    setRefreshKey((k) => k + 1);
    return food;
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors />
      <header className="bg-primary text-primary-foreground text-center px-4 py-5">
        <h1 className="text-xl font-bold m-0">{"🥗"} 饮食黑白名单</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">管理你的健康饮食清单</p>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Card className="p-4">
          <RandomPicker whiteList={whiteList} onPick={handleRandomPick} />
        </Card>
        <CalendarJournal key={refreshKey} />
        <Card className="p-4">
          <Tabs defaultValue="whitelist" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-3">
              <TabsList>
                <TabsTrigger value="whitelist" className="text-sm">
                  {"✅"} 白名单
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{whiteList.length}</span>
                </TabsTrigger>
                <TabsTrigger value="blacklist" className="text-sm">
                  {"❌"} 黑名单
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{blackList.length}</span>
                </TabsTrigger>
              </TabsList>
              <Button onClick={() => handleAdd(activeTab as "whitelist" | "blacklist")} size="sm">+ 添加</Button>
            </div>
            <TabsContent value="whitelist" className="mt-0">
              <FoodList foods={whiteList} type="whitelist" loading={loading} onEdit={handleEdit} onDelete={handleDelete} onAdd={() => handleAdd("whitelist")} />
            </TabsContent>
            <TabsContent value="blacklist" className="mt-0">
              <FoodList foods={blackList} type="blacklist" loading={loading} onEdit={handleEdit} onDelete={handleDelete} onAdd={() => handleAdd("blacklist")} />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      <FoodDialog open={dialogOpen} editingFood={editingFood} defaultType={dialogType} onClose={handleDialogClose} onSave={handleSave} />
    </div>
  );
}
