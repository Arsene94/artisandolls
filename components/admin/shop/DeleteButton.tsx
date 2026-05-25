"use client";

import { useTransition } from "react";

type Props = {
    onDelete: () => Promise<void>;
    confirmMessage: string;
    label?: string;
};

export default function DeleteButton({
    onDelete,
    confirmMessage,
    label = "Șterge",
}: Props) {
    const [pending, startTransition] = useTransition();

    const handle = () => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
            try {
                await onDelete();
            } catch (err) {
                if (err instanceof Error) {
                    window.alert(err.message);
                }
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handle}
            disabled={pending}
            className="text-[0.72rem] uppercase tracking-[0.16em] text-danger hover:text-silk hover:bg-danger/20 px-3 py-1.5 rounded-full disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
            {pending ? "…" : label}
        </button>
    );
}
