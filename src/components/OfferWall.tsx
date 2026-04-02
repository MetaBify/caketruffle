"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { type Lang, t } from "@/lib/i18n";

type Offer = {
  id: string;
  name: string;
  anchor: string;
  conversion: string;
  url: string;
  network_icon?: string;
  user_payout?: string;
};

type OfferWallProps = {
  lang: Lang;
  code: string;
  title: string;
  imageUrl?: string | null;
  waitSeconds: number;
  s1?: string | null;
  s2?: string | null;
};

export default function OfferWall({
  lang,
  code,
  title,
  imageUrl,
  waitSeconds,
  s1,
  s2,
}: OfferWallProps) {
  const [secondsLeft, setSecondsLeft] = useState(waitSeconds);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leadComplete, setLeadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canContinue = secondsLeft <= 0 || leadComplete;

  useEffect(() => {
    document.body.dataset.adclickDisabled = "true";
    return () => {
      delete document.body.dataset.adclickDisabled;
    };
  }, []);

  useEffect(() => {
    fetch(`/api/links/start?code=${encodeURIComponent(code)}`).catch(
      () => undefined
    );
  }, [code]);

  useEffect(() => {
    if (waitSeconds <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [waitSeconds]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (s1) params.set("s1", s1);
    if (s2) params.set("s2", s2);
    fetch(`/api/offers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch(() => setError(t(lang, "offerError")));
  }, [s1, s2, lang]);

  useEffect(() => {
    const interval = setInterval(() => {
      const params = new URLSearchParams();
      if (s1) params.set("s1", s1);
      if (s2) params.set("s2", s2);
      fetch(`/api/leads?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setLeadComplete(true);
          }
        })
        .catch(() => undefined);
    }, 15000);
    return () => clearInterval(interval);
  }, [s1, s2]);

  const prettyTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex flex-col gap-6">
        <section className="w-full rounded-[32px] border border-white/70 bg-white/80 p-8 text-center shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">
            {t(lang, "linkAccess")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="mt-5 h-[220px] w-full rounded-3xl object-cover shadow-sm"
            />
          ) : null}
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            {t(lang, "waitOrOffer")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm font-semibold text-[color:var(--accent-3)]">
              {prettyTime}
            </div>
            {leadComplete ? (
              <span className="text-sm font-semibold text-[color:var(--accent-3)]">
                {t(lang, "offerComplete")}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-[color:var(--muted)]">
            {t(lang, "waitToContinue")} {t(lang, "orComplete")}
          </p>

          <div className="mt-8">
            <button
              type="button"
              disabled={!canContinue}
              onClick={async () => {
                if (!canContinue) return;
                setActionError(null);
                const response = await fetch(
                  `/api/links/continue?code=${encodeURIComponent(code)}`,
                  { cache: "no-store" }
                );
                if (!response.ok) {
                  const data = await response.json().catch(() => ({}));
                  if (data?.remaining) {
                    setSecondsLeft(Math.max(Number(data.remaining), 0));
                  }
                  setActionError("Not ready yet. Please wait a bit longer.");
                  return;
                }
                const data = (await response.json()) as { url?: string };
                if (data.url) {
                  window.open(data.url, "_blank", "noopener,noreferrer");
                }
              }}
              className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition sm:w-auto ${
                canContinue
                  ? "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-3)]"
                  : "cursor-not-allowed bg-[color:var(--surface-2)] text-[color:var(--muted)]"
              }`}
            >
              {canContinue
                ? t(lang, "continue")
                : `${t(lang, "waitToContinue")} (${prettyTime})`}
            </button>
            {!canContinue ? (
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                {t(lang, "orComplete")}
              </p>
            ) : null}
            {actionError ? (
              <p className="mt-2 text-xs text-[color:var(--accent-3)]">
                {actionError}
              </p>
            ) : null}
          </div>
        </section>

        <aside className="w-full space-y-4">
          <div className="rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              {t(lang, "offersTitle")}
            </h2>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              {t(lang, "offerDisclaimer")}
            </p>
            {error ? (
              <p className="mt-4 text-sm text-[color:var(--accent-3)]">
                {error}
              </p>
            ) : null}
            <div className="mt-4 space-y-3">
              {offers.length === 0 ? (
                <p className="text-sm text-[color:var(--muted)]">
                  {t(lang, "offersLoading")}
                </p>
              ) : (
                offers.map((offer) => (
                  <a
                    key={offer.id}
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {offer.network_icon ? (
                      <img
                        src={offer.network_icon}
                        alt={offer.name}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-[color:var(--surface-2)]" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{offer.anchor}</p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {offer.conversion}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[color:var(--accent-3)]" />
                  </a>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
