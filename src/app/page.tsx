const PHASES = [
  { name: "Scaffold", done: true },
  { name: "Foundation (auth + map)", done: false },
  { name: "Trips & timeline", done: false },
  { name: "Extra map layers", done: false },
  { name: "Real statistics", done: false },
  { name: "Public profiles", done: false },
  { name: "Achievements", done: false },
];

export default function Home() {
  return (
    <div className="flex flex-1 bg-bg">
      <main className="flex w-full max-w-xl flex-col gap-8 px-8 py-24 md:px-16">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-4xl text-ink">Waypoint</h1>
          <p className="text-lg leading-7 text-muted">
            A travel tracker for the countries, US states, national parks,
            and UNESCO sites you&apos;ve visited - built without an AI
            dependency.
          </p>
        </div>

        <div className="flex gap-4 text-sm">
          <a href="/login" className="rounded-md border border-line px-4 py-2 text-ink hover:border-accent">
            Log in
          </a>
          <a href="/signup" className="rounded-md bg-accent px-4 py-2 font-medium text-bg hover:opacity-90">
            Sign up
          </a>
        </div>

        <ol className="flex flex-col gap-2 border-t border-line pt-6">
          {PHASES.map((phase) => (
            <li key={phase.name} className="flex items-center gap-3 text-sm text-muted">
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full ${phase.done ? "bg-accent" : "bg-line"}`}
              />
              {phase.name}
            </li>
          ))}
        </ol>

        <p className="text-sm text-muted">
          See{" "}
          <a
            className="font-medium text-accent underline"
            href="https://github.com/TPLilsby/Waypoint/blob/main/docs/ROADMAP.md"
          >
            docs/ROADMAP.md
          </a>{" "}
          for the full build plan.
        </p>
      </main>
    </div>
  );
}
