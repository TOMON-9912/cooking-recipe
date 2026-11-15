"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/presentation/components/LoadingSpinner";

type NavigationRequest = {
    /** 操作を始めたときの URL */
    from: string;
    /** リンクが指している URL。フォーム送信で行き先が未定のときは空文字 */
    to: string;
};

/**
 * クリック先が別ページへのアプリ内リンクなら、そのパスを返す。
 * ボタンの中のクリックは、ページ遷移ではなく操作なので対象にしない。
 * @param event ドキュメントで捕捉したクリック
 * @returns 遷移先のパスとクエリ。対象外なら null
 */
function appPageLinkTarget(event: MouseEvent): string | null {
    if (event.button !== 0) {
        return null;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return null;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
        return null;
    }
    if (target.closest("button, input, textarea, select")) {
        return null;
    }

    const anchor = target.closest("a");
    if (!(anchor instanceof HTMLAnchorElement)) {
        return null;
    }
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return null;
    }

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) {
        return null;
    }

    const next = new URL(anchor.href);
    if (next.origin !== window.location.origin) {
        return null;
    }
    if (
        next.pathname === window.location.pathname &&
        next.search === window.location.search
    ) {
        return null;
    }

    return `${next.pathname}${next.search}`;
}

/**
 * 別ページを開く GET 送信なら true。
 * Server Action の form は method が post で、action は空か javascript: になる。
 * @param form 送信されたフォーム
 * @returns 別ページを開く送信なら true
 */
function isPageGetForm(form: HTMLFormElement): boolean {
    const action = form.getAttribute("action");
    if (!action || action.startsWith("javascript:")) {
        return false;
    }
    return form.method.toLowerCase() === "get";
}

/**
 * ページを開く操作を始めた画面にまだいるあいだだけ、待ちとみなす。
 * ログインのように、開いたあとの画面から別の URL へ移る操作では出し続けない。
 * @param request 始めたときの URL と、リンクの URL。待ちがなければ null
 * @param current いまの URL
 * @returns スピナーを出しているあいだ true
 */
export function isNavigationPending(
    request: NavigationRequest | null,
    current: string,
): boolean {
    if (request === null) {
        return false;
    }
    return current === request.from && current !== request.to;
}

/**
 * 画面内のリンク、GET のフォーム、サーバへ送るボタンの待ちを、同じスピナーで出す。
 * 各画面のボタンは変更しない。fetch は差し替えない。
 * @returns 待ちのあいだのスピナー。待ちでなければ何も出さない
 */
export function LoadingOverlay() {
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const current = search ? `${pathname}?${search}` : pathname;
    const [request, setRequest] = useState<NavigationRequest | null>(null);
    const [actionPage, setActionPage] = useState<string | null>(null);
    if (actionPage !== null && actionPage !== current) {
        setActionPage(null);
    }
    const pending =
        isNavigationPending(request, current) || actionPage === current;

    useEffect(() => {
        /**
         * ボタンが処理中になってから、終わるか画面から外れるまでスピナーを出す。
         * @param button 押したボタン
         * @param form そのボタンのフォーム。無い操作もある
         */
        const watchAction = (
            button: HTMLButtonElement,
            form: HTMLFormElement | null,
        ) => {
            let started = false;
            const observer = new MutationObserver(() => {
                const connected = form ? form.isConnected : button.isConnected;
                if (!connected) {
                    observer.disconnect();
                    setActionPage(null);
                    return;
                }
                if (button.disabled) {
                    if (!started) {
                        started = true;
                        setActionPage(current);
                    }
                    return;
                }
                if (started) {
                    observer.disconnect();
                    setActionPage(null);
                }
            });
            observer.observe(document.body, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ["disabled"],
            });
        };

        const onClick = (event: MouseEvent) => {
            const next = appPageLinkTarget(event);
            if (next) {
                setRequest({ from: current, to: next });
                return;
            }
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }
            const button = target.closest("button");
            if (!(button instanceof HTMLButtonElement) || button.type === "submit") {
                return;
            }
            watchAction(button, button.form);
        };

        const onSubmit = (event: SubmitEvent) => {
            const form = event.target;
            if (!(form instanceof HTMLFormElement)) {
                return;
            }
            if (isPageGetForm(form)) {
                setRequest({ from: current, to: "" });
                return;
            }
            const submitter = event.submitter;
            if (submitter instanceof HTMLButtonElement) {
                watchAction(submitter, form);
            }
        };

        document.addEventListener("click", onClick, true);
        document.addEventListener("submit", onSubmit, true);
        return () => {
            document.removeEventListener("click", onClick, true);
            document.removeEventListener("submit", onSubmit, true);
        };
    }, [current]);

    if (!pending) {
        return null;
    }

    return (
        <div className="fixed inset-0 top-16 z-40 flex items-center justify-center bg-gray-50">
            <LoadingSpinner
                label="読み込み中"
                size="md"
                className="text-emerald-600"
            />
        </div>
    );
}
