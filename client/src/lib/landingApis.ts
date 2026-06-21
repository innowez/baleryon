// services/category.ts

import { apiFetch } from "@/lib/api";
import type {
  CategoriesResponse,
  LimitedSeasonResponse,
} from "@/types/landinTypes";

export async function fetchCategories() {
  return apiFetch<CategoriesResponse>("/api/category/getCategories");
}

export async function fetchActiveLimitedSeason() {
  return apiFetch<LimitedSeasonResponse>("/api/limited-season/active");
}
