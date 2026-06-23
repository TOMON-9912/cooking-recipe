import type { Profile } from "@/domain/models/profile/profile";

export type CreateProfileResult =
    | { success: true; profile: Profile }
    | { success: false; error: string };
