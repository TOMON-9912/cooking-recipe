type ResolveThumbnailPathInput = {
    /** 編集フォームとして使っているか */
    isEdit: boolean;
    /** 今回アップロードした画像のパス */
    uploadedPath?: string;
    /** プレビューが残っているか。編集時に false なら画像を外したとみなす */
    hasPreview: boolean;
    /** 編集前に保存されていたパス */
    currentPath?: string | null;
};

/**
 * 送信するサムネイルのパスを決める。
 *
 * @param input アップロード結果とフォームの状態
 * @returns 新規作成で画像なしなら undefined、編集で画像を外したときは null
 */
export function resolveThumbnailPath({
    isEdit,
    uploadedPath,
    hasPreview,
    currentPath,
}: ResolveThumbnailPathInput): string | null | undefined {
    if (uploadedPath) {
        return uploadedPath;
    }

    if (!isEdit) {
        return undefined;
    }

    return hasPreview ? currentPath ?? null : null;
}
