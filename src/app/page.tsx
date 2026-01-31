import TrendingTemplates from "@/components/TrendingTemplates";

export default function Home() {
  return (
    <main className="min-h-screen bg-sand-50">
      <header className="container-base flex flex-col items-start gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xl font-semibold uppercase tracking-[0.4em] text-ink-700">
          Reveal
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-ink-900/15 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-ink-900"
          >
            Login
          </button>
          <a
            href="/create"
            className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-sand-50"
          >
            Create Invite
          </a>
        </div>
      </header>

      <section className="section">
        <div className="container-base grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-ink-600">
              Interactive invitations
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-ink-900 md:text-6xl">
              An invitation worth opening.
            </h1>
            <p className="text-lg text-ink-700 md:text-xl">
              Reveal pairs a beautiful invite with a playful unlock moment — so
              plans feel like something you receive, not just a link you tap.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/create"
                className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-sand-50"
              >
                Create your invite
              </a>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="overflow-hidden rounded-3xl border border-ink-900/10 bg-white/80">
              <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4 text-xs uppercase tracking-[0.2em] text-ink-600">
                <span>Reveal Preview</span>
                <span className="rounded-full bg-sand-100 px-2 py-1 text-[10px]">
                  Demo
                </span>
              </div>
              <video
                className="h-auto w-full object-cover"
                autoPlay
                muted
                playsInline
              >
                <source src="/mp4example.mp4" type="video/mp4" />
                <source src="/homepage.mov" type="video/quicktime" />
              </video>
            </div>
          </div>
        </div>
      </section>

      <TrendingTemplates />

      <section id="how" className="section">
        <div className="container-base grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Create the invite",
              copy: "Add dinner details and pick a mini-game."
            },
            {
              title: "Share the link",
              copy: "Send a locked invite or preview it yourself."
            },
            {
              title: "Unlock the moment",
              copy: "Guests play a 20-second game before the reveal."
            }
          ].map((step) => (
            <div key={step.title} className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-ink-700">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="container-base pb-10 pt-6 text-xs text-ink-600">
        © 2026 Reveal
      </footer>
    </main>
  );
}
