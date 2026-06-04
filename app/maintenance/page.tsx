"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

const rawMaintenancePeriod = process.env.NEXT_PUBLIC_MAINTENANCE_PERIOD;

function parseMaintenanceSchedule(value?: string) {
  if (!value) return undefined;

  const normalized = value.trim();
  const match = normalized.match(/^(\d+)\s*(mo|[wdhms])$/i);

  if (!match) {
    return {
      label: normalized,
    };
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const seconds =
    unit === "mo"
      ? amount * 2592000
      : unit === "w"
        ? amount * 604800
        : unit === "d"
          ? amount * 86400
          : unit === "h"
            ? amount * 3600
            : unit === "m"
              ? amount * 60
              : amount;
  const labels: Record<string, string> = {
    mo: amount === 1 ? "month" : "months",
    w: amount === 1 ? "week" : "weeks",
    d: amount === 1 ? "day" : "days",
    h: amount === 1 ? "hour" : "hours",
    m: amount === 1 ? "minute" : "minutes",
    s: amount === 1 ? "second" : "seconds",
  };

  return {
    label: `${amount} ${labels[unit]}`,
    seconds,
  };
}

function formatRemainingTime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  if (days > 0) {
    return `${days}d:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${pad(minutes)}:${pad(secs)}`;
}

export default function MaintenancePage() {
  const maintenanceSchedule = useMemo(
    () => parseMaintenanceSchedule(rawMaintenancePeriod),
    [],
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [displayLabel, setDisplayLabel] = useState<string | undefined>(
    maintenanceSchedule?.label,
  );

  useEffect(() => {
    if (!maintenanceSchedule) {
      return;
    }

    if (maintenanceSchedule.seconds === undefined) {
      setDisplayLabel(maintenanceSchedule.label);
      return;
    }

    const storageKey = `maintenance-countdown-end-${rawMaintenancePeriod ?? "default"}`;
    const rawStored = localStorage.getItem(storageKey);
    const now = Date.now();
    let endTimestamp = rawStored ? Number(rawStored) : NaN;

    if (!rawStored || isNaN(endTimestamp) || endTimestamp <= now) {
      endTimestamp = now + maintenanceSchedule.seconds * 1000;
      localStorage.setItem(storageKey, String(endTimestamp));
    }

    const updateCountdown = () => {
      const deltaSeconds = Math.max(
        0,
        Math.round((endTimestamp - Date.now()) / 1000),
      );
      setRemainingSeconds(deltaSeconds);

      if (deltaSeconds === 0) {
        localStorage.removeItem(storageKey);
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, [maintenanceSchedule]);

  const countdownLabel =
    remainingSeconds !== null && remainingSeconds > 0
      ? formatRemainingTime(remainingSeconds)
      : undefined;
  const periodText = countdownLabel ?? displayLabel;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/50 backdrop-blur-sm">
        <header className="space-y-4 text-center">
          <p className="inline-flex rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Maintenance mode
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            We&rsquo;ll be right back.
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-400 sm:text-base">
            The site is currently undergoing scheduled maintenance. We
            appreciate your patience while we make improvements.
          </p>
        </header>

        <section className="w-full mt-10">
          <img
            src="/mode.png"
            alt="No message"
            className="w-full h-96 opacity-80"
          />
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-lg font-semibold text-white">Status</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The system is temporarily unavailable while maintenance is in
              progress.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-lg font-semibold text-white">Estimated time</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {periodText ? (
                <>
                  Expected completion:{" "}
                  <span className="font-semibold text-white">{periodText}</span>
                  .
                </>
              ) : (
                "We will be back online shortly."
              )}
            </p>
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>
            If you need urgent assistance, please contact support or check back
            later.
          </p>
        </footer>
      </div>
    </main>
  );
}
