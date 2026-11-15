import { LoadingSpinner } from "@/presentation/components/LoadingSpinner";

/**
 * 次のページのサーバ描画が終わるまで出す。
 * Next.js はこのファイルを、ページを開く待ち時間の表示として使う。
 * @returns 画面中央のスピナー
 */
export default function Loading() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingSpinner
                label="読み込み中"
                size="md"
                className="text-emerald-600"
            />
        </div>
    );
}
