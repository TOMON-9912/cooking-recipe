import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
    /** 読み上げる待ちの説明 */
    label: string;
    /** ページ中央は md */
    size?: "sm" | "md";
    /** 色など、外側から足すクラス */
    className?: string;
};

/**
 * 待ち時間であることを示すスピナー。
 * @param props 読み上げ名、大きさ、追加クラス
 * @returns スピナー
 */
export function LoadingSpinner({
    label,
    size = "sm",
    className = "",
}: LoadingSpinnerProps) {
    const iconClass = size === "md" ? "h-8 w-8" : "h-4 w-4";

    return (
        <span
            role="status"
            aria-label={label}
            className={`inline-flex ${className}`}
        >
            <Loader2 className={`${iconClass} animate-spin`} aria-hidden="true" />
        </span>
    );
}
