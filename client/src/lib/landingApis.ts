// services/category.ts

import { apiFetch } from "@/lib/api";
import type {
  Banner,
  CategoriesResponse,
  InstagramPost,
  LimitedSeasonResponse,
} from "@/types/landinTypes";

export async function fetchCategories() {
  return apiFetch<CategoriesResponse>("/api/category/getCategories");
}

export async function fetchActiveLimitedSeason() {
  return apiFetch<LimitedSeasonResponse>("/api/limited-season/active");
}

export async function fetchActiveBanner() {
  return apiFetch<{
    banner: Banner;
  }>("/api/banner/active");
}

export async function fetchInstagramPosts() {
  return apiFetch<{
    posts: InstagramPost[];
  }>("/api/instagram/posts");
}

export const joinCommunity = async (email: string) => {
  return apiFetch<{
    message: string;
  }>("/api/community/join", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
};
