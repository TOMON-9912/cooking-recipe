"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** 出現アニメーションの遅延（ミリ秒）。並べて少しずつ出すときに使う */
  delayMs?: number;
  className?: string;
};

/**
 * 画面内に入ったら一度だけフェードアップ表示するラッパー。
 * IntersectionObserver を使い、スクロール連動の出現演出を担う。
 *
 * @param children 内側に表示する要素
 * @param delayMs 出現を遅らせるミリ秒（スタッガー演出用）
 * @param className 追加で付与するクラス
 * @returns ラップした要素
 */
export function Reveal({ children, delayMs = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("lp-reveal", visible && "is-visible", className)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
