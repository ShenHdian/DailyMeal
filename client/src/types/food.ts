export interface Food {
  id: string;
  name: string;
  type: "whitelist" | "blacklist";
  createdAt: string;
}

export interface HistoryRecord {
  id: string;
  foodName: string;
  createdAt: string;
}
