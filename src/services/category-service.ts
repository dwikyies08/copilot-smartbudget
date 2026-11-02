import { db } from "@/db";
import { categories } from "@/db/schema";

export async function getCategoryOptions() {
  return db.select().from(categories);
}
