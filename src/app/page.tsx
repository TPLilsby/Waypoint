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
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-8 py-24">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Waypoint
          </h1>
          <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400">
            A travel tracker for the countries, US states, national parks,
            and UNESCO sites you&apos;ve visited - built without an AI
            dependency.
          </p>
        </div>

        <ol className="flex flex-col gap-2">
          {PHASES.map((phase) => (
            <li
              key={phase.name}
              className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full ${
                  phase.done ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
              {phase.name}
            </li>
          ))}
        </ol>

        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          See{" "}
          <a
            className="font-medium underline"
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
