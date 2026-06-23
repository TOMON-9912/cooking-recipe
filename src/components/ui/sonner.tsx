"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * アプリ共通のトースト表示
 */
export function Toaster({ ...props }: ToasterProps) {
    return (
        <Sonner
            position="top-center"
            richColors
            closeButton
            toastOptions={{
                classNames: {
                    toast: "rounded-lg border border-gray-100 shadow-lg",
                    title: "text-gray-900 font-medium",
                    description: "text-gray-600",
                    success: "bg-white text-gray-900",
                },
            }}
            {...props}
        />
    );
}
