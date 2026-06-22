"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TOAST_MESSAGES, type ToastQueryKey } from "@/constants/toast-messages";

/**
 * URL の `toast` クエリに応じてトーストを表示し、表示後にクエリを除去する
 */
function ToastFromSearchParamsInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const shownKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const key = searchParams.get("toast") as ToastQueryKey | null;
        if (!key || !(key in TOAST_MESSAGES) || shownKeyRef.current === key) {
            return;
        }

        shownKeyRef.current = key;
        toast.success(TOAST_MESSAGES[key]);

        const params = new URLSearchParams(searchParams.toString());
        params.delete("toast");
        const nextUrl = params.size > 0 ? `${pathname}?${params}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [searchParams, router, pathname]);

    return null;
}

/**
 * Suspense 境界付きのクエリパラメータ連動トースト
 */
export function ToastFromSearchParams() {
    return (
        <Suspense fallback={null}>
            <ToastFromSearchParamsInner />
        </Suspense>
    );
}
