"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
    enqueueAllTranslationsAction,
    enqueueEntityTranslationsAction,
    pollTranslationOpsSnapshot,
} from "./actions";
import type { OperationsSnapshot } from "@/lib/translations/operations";
import styles from "./TranslationOps.module.css";

type Props = {
    initialSnapshot: OperationsSnapshot;
};

const POLL_INTERVAL_MS = 4_000;

function percent(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
}

function classForProgress(pct: number): string {
    if (pct >= 100) return styles.progressBarComplete;
    if (pct >= 60) return styles.progressBarHigh;
    if (pct >= 25) return styles.progressBarMid;
    return styles.progressBarLow;
}

export default function TranslationOpsClient({ initialSnapshot }: Props) {
    const [snapshot, setSnapshot] = useState<OperationsSnapshot>(initialSnapshot);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [lastError, setLastError] = useState<string | null>(null);
    const [lastEnqueueLabel, setLastEnqueueLabel] = useState<string | null>(null);
    const pollTimerRef = useRef<number | null>(null);

    const refresh = useCallback(async () => {
        try {
            const next = await pollTranslationOpsSnapshot();
            setSnapshot(next);
            setLastError(null);
        } catch (err) {
            setLastError(err instanceof Error ? err.message : "Refresh eșuat.");
        }
    }, []);

    useEffect(() => {
        if (!autoRefresh) {
            if (pollTimerRef.current !== null) {
                window.clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
            return;
        }
        // Poll-ul rulează independent de UI: chiar dacă admin-ul închide
        // tab-ul, worker-ul QStash continuă să proceseze; la următoarea
        // deschidere, snapshot-ul din DB e adevărul.
        pollTimerRef.current = window.setInterval(() => {
            void refresh();
        }, POLL_INTERVAL_MS);
        return () => {
            if (pollTimerRef.current !== null) {
                window.clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [autoRefresh, refresh]);

    const handleEnqueueAll = (scope: "missing" | "all" | "retry-failed") => {
        const fd = new FormData();
        fd.set("scope", scope);
        setLastEnqueueLabel(
            scope === "missing"
                ? "Enqueue în curs · lipsuri"
                : scope === "all"
                  ? "Enqueue în curs · totul"
                  : "Enqueue în curs · retry failed",
        );
        startTransition(async () => {
            try {
                await enqueueAllTranslationsAction(fd);
                await refresh();
                setLastError(null);
            } catch (err) {
                setLastError(err instanceof Error ? err.message : "Enqueue eșuat.");
            } finally {
                setLastEnqueueLabel(null);
            }
        });
    };

    const handleEnqueueEntity = (entity: string, scope: "missing" | "all" | "retry-failed") => {
        const fd = new FormData();
        fd.set("entity", entity);
        fd.set("scope", scope);
        setLastEnqueueLabel(`Enqueue · ${entity} (${scope})`);
        startTransition(async () => {
            try {
                await enqueueEntityTranslationsAction(fd);
                await refresh();
                setLastError(null);
            } catch (err) {
                setLastError(err instanceof Error ? err.message : "Enqueue eșuat.");
            } finally {
                setLastEnqueueLabel(null);
            }
        });
    };

    const totalsPct = percent(snapshot.totals.readySlots, snapshot.totals.totalSlots);

    return (
        <div className={styles.wrapper}>
            <section className={styles.summary}>
                <div className={styles.summaryHeader}>
                    <div>
                        <span className={styles.eyebrow}>Progres global</span>
                        <strong className={styles.bigNumber}>
                            {totalsPct}%
                            <small>
                                {snapshot.totals.readySlots} / {snapshot.totals.totalSlots} câmpuri
                            </small>
                        </strong>
                    </div>
                    <div className={styles.statRow}>
                        <div className={styles.statPill}>
                            <span>Tradus</span>
                            <strong>{snapshot.totals.readySlots}</strong>
                        </div>
                        <div className={styles.statPill}>
                            <span>În coadă</span>
                            <strong>{snapshot.totals.pendingSlots}</strong>
                        </div>
                        <div className={`${styles.statPill} ${styles.statPillDanger}`}>
                            <span>Eșuate</span>
                            <strong>{snapshot.totals.failedSlots}</strong>
                        </div>
                        <div className={styles.statPill}>
                            <span>Netraduse</span>
                            <strong>{snapshot.totals.untouchedSlots}</strong>
                        </div>
                    </div>
                </div>

                <div
                    className={styles.progressTrack}
                    role="progressbar"
                    aria-valuenow={totalsPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className={`${styles.progressBar} ${classForProgress(totalsPct)}`}
                        style={{ width: `${totalsPct}%` }}
                    />
                </div>

                <div className={styles.actionRow}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => handleEnqueueAll("missing")}
                        disabled={isPending}
                    >
                        Tradu ce lipsește
                    </button>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => handleEnqueueAll("retry-failed")}
                        disabled={isPending || snapshot.totals.failedSlots === 0}
                    >
                        Retry eșuate
                    </button>
                    <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={() => {
                            if (
                                window.confirm(
                                    "Asta va re-pune la coadă TOATE câmpurile, suprascriind traducerile existente. Continui?",
                                )
                            ) {
                                handleEnqueueAll("all");
                            }
                        }}
                        disabled={isPending}
                    >
                        Retradu tot
                    </button>

                    <label className={styles.autoRefresh}>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto-refresh la {POLL_INTERVAL_MS / 1000}s
                    </label>

                    <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => void refresh()}
                        disabled={isPending}
                    >
                        Refresh acum
                    </button>
                </div>

                {lastEnqueueLabel ? (
                    <p className={styles.status} role="status">
                        {lastEnqueueLabel}…
                    </p>
                ) : null}
                {lastError ? (
                    <p className={styles.error} role="alert">
                        {lastError}
                    </p>
                ) : null}
            </section>

            <section className={styles.tableWrap}>
                <header className={styles.tableHeader}>
                    <h2>Per entitate</h2>
                    <p>
                        Câmp = (rând × locale × coloană tradusă). Totalurile sar
                        peste câmpurile RO goale, ca să nu poluăm progresul cu
                        traduceri inutile.
                    </p>
                </header>

                <div className={styles.table}>
                    <div className={styles.tableHead}>
                        <span>Entitate</span>
                        <span>Rânduri</span>
                        <span>Progres</span>
                        <span>Tradus</span>
                        <span>Coadă</span>
                        <span>Eșuate</span>
                        <span>Netraduse</span>
                        <span>Acțiuni</span>
                    </div>

                    {snapshot.perEntity.map((row) => {
                        const pct = percent(row.readySlots, row.totalSlots);
                        return (
                            <div key={row.entity} className={styles.tableRow}>
                                <span className={styles.entityName}>
                                    <strong>{row.label}</strong>
                                    <small>{row.entity}</small>
                                </span>
                                <span>{row.totalRows}</span>
                                <span className={styles.progressCell}>
                                    <span className={styles.progressTrackInline}>
                                        <span
                                            className={`${styles.progressBarInline} ${classForProgress(pct)}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </span>
                                    <strong>{pct}%</strong>
                                </span>
                                <span>{row.readySlots}</span>
                                <span>{row.pendingSlots}</span>
                                <span className={row.failedSlots > 0 ? styles.danger : undefined}>
                                    {row.failedSlots}
                                </span>
                                <span>{row.untouchedSlots}</span>
                                <span className={styles.rowActions}>
                                    <button
                                        type="button"
                                        className={styles.linkBtn}
                                        onClick={() => handleEnqueueEntity(row.entity, "missing")}
                                        disabled={isPending || row.untouchedSlots + row.pendingSlots + row.failedSlots === 0}
                                    >
                                        Lipsuri
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.linkBtn}
                                        onClick={() => handleEnqueueEntity(row.entity, "retry-failed")}
                                        disabled={isPending || row.failedSlots === 0}
                                    >
                                        Retry
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.dangerBtnSmall}
                                        onClick={() => {
                                            if (window.confirm(`Retradu TOATE câmpurile pentru ${row.label}?`)) {
                                                handleEnqueueEntity(row.entity, "all");
                                            }
                                        }}
                                        disabled={isPending}
                                    >
                                        Tot
                                    </button>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
