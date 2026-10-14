import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import ChannelFlip from "../components/ChannelFlip";
import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import clientSites, { type ClientSite } from "../data/websites";
import type { NavigateFunction } from "../types";
import { loadTurnstile, sendInquiry, TURNSTILE_SITE_KEY, type TurnstileApi } from "../utils/inquiry";

interface WebsitesProps {
  onNavigate?: NavigateFunction;
}

const WIDE_QUERY = "(min-width: 768px)";
const LINKEDIN_URL = "https://linkedin.com/in/ericsen-semedo";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useWideLayout() {
  return useSyncExternalStore(subscribeToWidth, () => window.matchMedia(WIDE_QUERY).matches, () => false);
}

/** Plays a site's clip only while most of it is on screen, so a phone never runs two at once. */
function SiteScreen({ site }: { site: ClientSite }) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.6 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion, site.project.id]);

  return (
    <div className="aspect-[16/10] overflow-hidden bg-black">
      {site.clip ? (
        <video
          key={site.project.id}
          ref={videoRef}
          src={site.clip}
          poster={site.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${site.project.title} website`}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <img src={site.poster} alt={`${site.project.title} website`} className="h-full w-full object-cover object-top" />
      )}
    </div>
  );
}

function VisitSite({ site }: { site: ClientSite }) {
  if (!site.liveUrl) return null;
  return (
    <a
      href={site.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="crt-action-shell inline-flex min-h-11 items-center gap-2 border border-crt-border-secondary px-4 py-2 font-mono text-crt-text transition-colors hover:bg-crt-text hover:text-[#111] focus:outline-none focus:ring-2 focus:ring-crt-accent/50"
    >
      Visit site <span aria-hidden="true">↗</span>
    </a>
  );
}

function SiteCard({ site }: { site: ClientSite }) {
  return (
    <li data-enter="copy" className="border border-crt-border bg-crt-surface-primary">
      <SiteScreen site={site} />
      <div className="p-4">
        <p className="text-sm text-crt-text-tertiary">{site.business}</p>
        <h2 className="mt-1 font-display text-lg font-bold tracking-wide text-crt-text">{site.project.title}</h2>
        <p className="mb-4 mt-1 leading-relaxed text-crt-text-secondary">{site.project.description}</p>
        <VisitSite site={site} />
      </div>
    </li>
  );
}

function SiteGuide() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const site = clientSites[selectedIndex];
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(16rem,1fr)] gap-8">
      <div data-enter="media">
        <div className="relative overflow-hidden border-[10px] border-crt-shell bg-black shadow-[0_0_0_1px_rgb(var(--crt-border-subtle))]">
          <SiteScreen site={site} />
          {!reduceMotion && (
            <ChannelFlip flipKey={site.project.id} number={`04-${selectedIndex + 1}`} title={site.project.title} osdClassName="right-4 top-3 text-2xl! md:text-2xl!" />
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4" aria-live="polite">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-crt-text">{site.project.title}</h2>
            <p className="mt-1 max-w-[52ch] text-crt-text-secondary">{site.project.description}</p>
          </div>
          <VisitSite site={site} />
        </div>
      </div>

      <ol data-enter="copy" className="self-start border-t border-crt-border" aria-label="Websites">
        {clientSites.map((entry, index) => (
          <li key={entry.project.id}>
            <button
              type="button"
              aria-pressed={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
              className={"grid min-h-16 w-full grid-cols-[3.5rem_1fr_auto] items-center gap-2 border-b border-crt-border-subtle px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crt-accent "
                + (index === selectedIndex ? "bg-crt-surface-secondary shadow-[inset_3px_0_0_rgb(var(--crt-accent-primary))]" : "hover:bg-crt-surface-primary")}
            >
              <span className={"font-mono text-sm " + (index === selectedIndex ? "text-crt-accent-text" : "text-crt-text-tertiary")}>04-{index + 1}</span>
              <span>
                <span className="block text-crt-text">{entry.project.title}</span>
                <span className="block text-sm text-crt-text-tertiary">{entry.business}</span>
              </span>
              <span className="font-mono text-sm text-crt-accent-text" aria-hidden="true">{index === selectedIndex ? "▶" : ""}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LinkedInFallback({ children }: { children: string }) {
  return (
    <>
      {children}{" "}
      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-crt-accent-text underline underline-offset-4">
        message me on LinkedIn
      </a>.
    </>
  );
}

/** The project form. Turnstile loads with it, so the room never pays for the spam check. */
function StartProject() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [checkFailed, setCheckFailed] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<{ api: TurnstileApi; id: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile().then((api) => {
      if (cancelled || !widgetRef.current) return;
      const id = api.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: (nextToken) => {
          setToken(nextToken);
          setCheckFailed(false);
        },
        "expired-callback": () => setToken(""),
        "error-callback": () => {
          setToken("");
          setCheckFailed(true);
        },
      });
      turnstileRef.current = { api, id };
    }).catch(() => {
      if (!cancelled) setCheckFailed(true);
    });
    return () => {
      cancelled = true;
      if (turnstileRef.current) turnstileRef.current.api.remove(turnstileRef.current.id);
      turnstileRef.current = null;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || status === "sending") return;
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "");
    setStatus("sending");
    const sent = await sendInquiry({
      name: value("name"),
      business: value("business"),
      message: value("message"),
      reply: value("reply"),
      website: value("website"),
    }, token);
    // A token works once, so a failed send needs a fresh check before the next try.
    setToken("");
    if (!sent && turnstileRef.current) turnstileRef.current.api.reset(turnstileRef.current.id);
    setStatus(sent ? "sent" : "failed");
  }

  const fieldClass = "mt-1 w-full border border-crt-border bg-crt-base px-3 py-2.5 text-crt-text focus:border-crt-accent focus:outline-none";
  const sent = status === "sent";
  return (
    <>
      {sent && (
        <p role="status" className="border border-crt-border bg-crt-surface-primary p-5 text-crt-text-secondary">
          Thanks. Your message is in my inbox, and I'll reply soon.
        </p>
      )}
      <form onSubmit={handleSubmit} hidden={sent} className="grid gap-4 border border-crt-border bg-crt-surface-primary p-5 sm:grid-cols-2">
        <label className="text-sm text-crt-text-secondary">Your name<input required maxLength={100} name="name" autoComplete="name" className={fieldClass} /></label>
        <label className="text-sm text-crt-text-secondary">Business<input maxLength={120} name="business" autoComplete="organization" className={fieldClass} /></label>
        <label className="text-sm text-crt-text-secondary sm:col-span-2">
          What do you need?
          <textarea required maxLength={5000} name="message" rows={3} className={fieldClass} />
        </label>
        <label className="text-sm text-crt-text-secondary sm:col-span-2">Email or phone<input required maxLength={200} name="reply" autoComplete="email" className={fieldClass} /></label>
        {/* Hidden from people; bots that fill it are dropped by the Worker. */}
        <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <div ref={widgetRef} className="min-h-[65px] sm:col-span-2" />
        {(status === "failed" || checkFailed) && (
          <p role="alert" className="text-crt-text-secondary sm:col-span-2">
            <LinkedInFallback>{status === "failed" ? "That didn't send. Try again, or" : "The spam check didn't load. Refresh the page, or"}</LinkedInFallback>
          </p>
        )}
        <CRTButton type="submit" disabled={!token || status === "sending"} className="sm:col-span-2">
          {status === "sending" ? "Sending…" : "Send"}
        </CRTButton>
      </form>
    </>
  );
}

/**
 * Websites - Client sites for prospects. Opens straight from a shared link: a guide beside a monitor
 * on wide screens, one card per site on phones, and it ends on starting a project.
 */
export default function Websites({ onNavigate }: WebsitesProps) {
  const isWide = useWideLayout();
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  function openForm() {
    setFormOpen(true);
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div tabIndex={-1} className="crt-page bg-page-tint h-full w-full overflow-y-auto text-crt-text">
      <div className="crt-content-container pb-16 pt-24 md:pt-28">
        <header className="mb-8 max-w-2xl">
          <ScrambleHeading as="h1" className="font-display text-3xl font-bold leading-tight tracking-wide text-crt-text md:text-5xl">
            Websites for local businesses
          </ScrambleHeading>
          <p data-enter="copy" className="mt-3 text-lg text-crt-text-secondary">Custom sites, designed and built for you.</p>
        </header>

        {isWide ? (
          <SiteGuide />
        ) : (
          <ul className="grid gap-5">
            {clientSites.map((site) => <SiteCard key={site.project.id} site={site} />)}
          </ul>
        )}

        <section ref={formRef} className="mt-14 scroll-mt-24 border-t border-crt-border pt-8" aria-labelledby="start-project-title">
          <h2 id="start-project-title" data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">Need a website?</h2>
          <div data-enter="copy" className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
            {formOpen
              ? <div className="w-full"><StartProject /></div>
              : <CRTButton size="lg" onClick={openForm}>Start a project</CRTButton>}
            <button
              type="button"
              onClick={() => onNavigate?.("portfolio")}
              className="min-h-11 font-mono text-crt-text-secondary transition-colors hover:text-crt-text focus-visible:outline-2 focus-visible:outline-crt-accent-text"
            >
              See all my work <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
