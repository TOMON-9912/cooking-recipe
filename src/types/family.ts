import type { Family } from "@/domain/models/family/family";

export type CreateFamilyResult =
    | { success: true; family: Family }
    | { success: false; error: string };
