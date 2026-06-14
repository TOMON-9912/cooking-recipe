"use client";

import { useEffect, useState } from "react";

/**
 * ページのスクロール量を 0〜100% で表すバー。
 * ヘッダー直下に固定表示し、読み進み度合いを視覚化する。
 *
 * @returns 進捗バー要素
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-300 transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
