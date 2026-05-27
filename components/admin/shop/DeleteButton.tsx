"use client";

import { useTransition } from "react";
import { IconTrash } from "@tabler/icons-react";

type Props = {
    onDelete: () => Promise<void>;
    confirmMessage: string;
    label?: string;
    icon?: boolean;
    className?: string;
};

export default function DeleteButton({
    onDelete,
    confirmMessage,
    label = "Șterge",
    icon = false,
    className,
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

    if (icon) {
        return (
            <button
                type="button"
                onClick={handle}
                disabled={pending}
                aria-label={label}
                title={label}
                className={
                    className ??
                    "inline-flex items-center justify-center text-danger hover:text-silk hover:bg-danger/20 p-1.5 rounded-full disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                }
            >
                <IconTrash size={18} />
            </button>
        );
    }

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
