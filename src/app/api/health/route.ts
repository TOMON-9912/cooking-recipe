import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * 死活確認と Free プラン休止対策用。
 * PostgREST 経由の軽い SELECT で DB アクティビティを発生させる。
 *
 * @returns 正常時 200 `{ ok: true }`、Supabase 到達不可時 503
 */
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").select("id").limit(1);

  if (error) {
    console.error("health check failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
