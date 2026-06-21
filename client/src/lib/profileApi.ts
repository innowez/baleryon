// lib/profileApi.ts

import { apiFetch } from "./api";
import { UserProfile } from "@/types/profile";

export async function fetchProfile(
  userId: string
): Promise<UserProfile> {
  return apiFetch<UserProfile>(
    `/api/profile/${userId}`
  );
}

export async function updateProfile(
  userId: string,
  data: {
    fullName: string;
    phone?: string;
    profileImage?: string;
  }
) {
  return apiFetch(`/api/profile/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}