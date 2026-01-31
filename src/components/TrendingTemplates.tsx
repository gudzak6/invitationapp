"use client";

type Template = {
  title: string;
  tag: string;
  videoSrc: string;
};

const templates: Template[] = [
  {
    title: "Modern Minimal",
    tag: "Dinner",
    videoSrc: "/scratch.mov"
  },
  {
    title: "Soft Bloom",
    tag: "Birthday",
    videoSrc: "/templates/soft-bloom.mp4"
  },
  {
    title: "Night Garden",
    tag: "Celebration",
    videoSrc: "/templates/night-garden.mp4"
  }
];

export default function TrendingTemplates() {
  return (
    <section className="section">
      <div className="container-base">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-ink-900">
            Trending templates
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Customize the perfect invite. 100% free, always.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.title}
              className="glass-panel overflow-hidden p-4"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-ink-600">
                <span>{template.title}</span>
                <span className="rounded-full bg-sand-100 px-2 py-1 text-[10px]">
                  {template.tag}
                </span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-ink-900/10 bg-white/80">
                <video
                  className="h-auto w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={template.videoSrc} type="video/mp4" />
                </video>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
