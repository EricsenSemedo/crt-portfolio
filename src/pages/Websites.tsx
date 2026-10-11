import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import ChannelFlip from "../components/ChannelFlip";
import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import StaticNoise from "../components/StaticNoise";
import clientSites from "../data/websites";
import type { ClientSite, NavigateFunction } from "../types";

interface WebsitesProps {
  onNavigate?: NavigateFunction;
}

const WIDE_QUERY = "(min-width: 768px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useWideLayout() {
  return useSyncExternalStore(subscribeToWidth, () => window.matchMedia(WIDE_QUERY).matches, () => false);
}

/** Plays a site's clip only while most of it is on screen, so a phone never runs three at once. */
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
  }, [reduceMotion, site.id]);

  if (site.visibility === "private") {
    return (
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <StaticNoise intensity={5} />
        <div className="demo-carousel__static absolute inset-0" />
        <p className="absolute inset-0 m-auto h-fit w-fit border border-crt-border bg-crt-base/90 px-4 py-2 font-mono text-sm text-crt-text">
          Private until launch
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] overflow-hidden bg-black">
      {site.clip ? (
        <video
          key={site.id}
          ref={videoRef}
          src={site.clip}
          poster={site.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${site.client} website`}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <img src={site.poster} alt={`${site.client} website`} className="h-full w-full object-cover object-top" />
      )}
    </div>
  );
}

function SiteAction({ site, onAskPreview }: { site: ClientSite; onAskPreview: (site: ClientSite) => void }) {
  if (site.visibility === "private") {
    return <CRTButton variant="secondary" onClick={() => onAskPreview(site)}>Ask for a preview</CRTButton>;
  }
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

function SiteCard({ site, onAskPreview }: { site: ClientSite; onAskPreview: (site: ClientSite) => void }) {
  return (
    <li data-enter="copy" className="border border-crt-border bg-crt-surface-primary">
      <SiteScreen site={site} />
      <div className="p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-crt-text-tertiary">{site.business}</p>
        <h2 className="mt-1 font-display text-lg font-bold tracking-wide text-crt-text">{site.client}</h2>
        <p className="mb-4 mt-1 leading-relaxed text-crt-text-secondary">{site.summary}</p>
        <SiteAction site={site} onAskPreview={onAskPreview} />
      </div>
    </li>
  );
}

function SiteGuide({ onAskPreview }: { onAskPreview: (site: ClientSite) => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const site = clientSites[selectedIndex];
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(16rem,1fr)] gap-8">
      <div data-enter="media">
        <div className="relative overflow-hidden border-[10px] border-crt-shell bg-black shadow-[0_0_0_1px_rgb(var(--crt-border-subtle))]">
          <SiteScreen site={site} />
          {!reduceMotion && (
            <ChannelFlip flipKey={site.id} number={`04-${selectedIndex + 1}`} title={site.client} osdClassName="right-4 top-3 text-2xl! md:text-2xl!" />
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4" aria-live="polite">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-crt-text">{site.client}</h2>
            <p className="mt-1 max-w-[52ch] text-crt-text-secondary">{site.summary}</p>
          </div>
          <SiteAction site={site} onAskPreview={onAskPreview} />
        </div>
      </div>

      <ol data-enter="copy" className="self-start border-t border-crt-border" aria-label="Websites">
        {clientSites.map((entry, index) => (
          <li key={entry.id}>
            <button
              type="button"
              aria-pressed={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
              className={"grid min-h-16 w-full grid-cols-[3.5rem_1fr_auto] items-center gap-2 border-b border-crt-border-subtle px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crt-accent "
                + (index === selectedIndex ? "bg-crt-surface-secondary shadow-[inset_3px_0_0_rgb(var(--crt-accent-primary))]" : "hover:bg-crt-surface-primary")}
            >
              <span className={"font-mono text-sm " + (index === selectedIndex ? "text-crt-accent-text" : "text-crt-text-tertiary")}>04-{index + 1}</span>
              <span>
                <span className="block text-crt-text">{entry.client}</span>
                <span className="block text-sm text-crt-text-tertiary">{entry.business}</span>
              </span>
              <span className="font-mono text-sm text-crt-accent-text" aria-hidden="true">
                {entry.visibility === "private" ? "LOCKED" : index === selectedIndex ? "▶" : ""}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StartProject({ previewOf }: { previewOf: ClientSite | null }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <p role="status" className="border border-crt-border bg-crt-surface-primary p-5 text-crt-text-secondary">
        Prototype: nothing was sent. In the real version this goes straight to my inbox.
      </p>
    );
  }

  const fieldClass = "mt-1 w-full border border-crt-border bg-crt-base px-3 py-2.5 text-crt-text focus:border-crt-accent focus:outline-none";
  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-crt-border bg-crt-surface-primary p-5 sm:grid-cols-2">
      <label className="text-sm text-crt-text-secondary">Your name<input required name="name" autoComplete="name" className={fieldClass} /></label>
      <label className="text-sm text-crt-text-secondary">Business<input name="business" autoComplete="organization" className={fieldClass} /></label>
      <label className="text-sm text-crt-text-secondary sm:col-span-2">
        What do you need?
        <textarea
          required
          name="message"
          rows={3}
          defaultValue={previewOf ? `I'd like to see a preview of the ${previewOf.client} site.` : ""}
          className={fieldClass}
        />
      </label>
      <label className="text-sm text-crt-text-secondary sm:col-span-2">Email or phone<input required name="reply" autoComplete="email" className={fieldClass} /></label>
      <CRTButton type="submit" className="sm:col-span-2">Send</CRTButton>
    </form>
  );
}

/**
 * Websites - Client sites for prospects. Opens straight from a shared link: a guide beside a monitor
 * on wide screens, one card per site on phones, and it ends on starting a project.
 */
export default function Websites({ onNavigate }: WebsitesProps) {
  const isWide = useWideLayout();
  const [formOpen, setFormOpen] = useState(false);
  const [previewOf, setPreviewOf] = useState<ClientSite | null>(null);
  const formRef = useRef<HTMLElement>(null);

  function openForm(site: ClientSite | null) {
    setPreviewOf(site);
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
          <SiteGuide onAskPreview={openForm} />
        ) : (
          <ul className="grid gap-5">
            {clientSites.map((site) => <SiteCard key={site.id} site={site} onAskPreview={openForm} />)}
          </ul>
        )}

        <section ref={formRef} className="relative mt-14 scroll-mt-24 pt-8" aria-labelledby="start-project-title">
          <span data-enter="rule" className="crt-rule" aria-hidden="true" />
          <h2 id="start-project-title" data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">
            {previewOf ? "Ask for a preview" : "Need a website?"}
          </h2>
          <div data-enter="copy" className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
            {formOpen
              ? <div className="w-full"><StartProject key={previewOf?.id ?? "project"} previewOf={previewOf} /></div>
              : <CRTButton size="lg" onClick={() => openForm(null)}>Start a project</CRTButton>}
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
