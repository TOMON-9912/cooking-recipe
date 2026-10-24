import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// cookies()が終わるまで一旦止まって、結果が帰ってきてから次の処理に進む
export async function createClient(){
    // ブラウザから送られたクッキー一式を取得
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies:{
                get(name:string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: Record<string, unknown>) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch {
                        // Server Component では cookie を set できない場合がある
                    }
                },
                remove(name: string, options: Record<string, unknown>) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch {
                        // Server Component では cookie を remove できない場合がある
                    }
                },
            },
        },
    );
}

/**
 * 認証済みであることを保証するクライアント生成関数。
 * 同じリクエスト内では 1 回だけ getUser する。連続して呼ぶと、
 * Server Component で保存できない更新済みトークンを古いトークンが上書きし、セッションが切れる。
 * セッションがない場合は UNAUTHORIZED を投げる。
 */
export const createAuthedClient = cache(async () => {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("UNAUTHORIZED");
    }

    return { supabase, user };
});
