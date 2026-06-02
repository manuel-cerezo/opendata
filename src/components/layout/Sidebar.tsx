import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/", label: "Inicio", end: true },
  { to: "/datos-gob-es", label: "datos.gob.es" },
  { to: "/datasets", label: "Conjuntos" },
];

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "block rounded-lg px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-accent/10 font-medium text-accent"
      : "text-muted hover:bg-bg hover:text-fg",
  ].join(" ");
}

export function Sidebar() {
  return (
    <header className="md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:shrink-0 md:border-r md:border-border md:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4 md:border-0 md:p-0">
        <NavLink to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-xl text-fg">OpenData</span>
            <span className="mt-0.5 text-[11px] text-muted">datos abiertos · España</span>
          </span>
        </NavLink>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>

      <nav className="hidden gap-1 md:mt-8 md:flex md:flex-1 md:flex-col" aria-label="Principal">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile horizontal nav */}
      <nav className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 md:hidden" aria-label="Principal móvil">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden items-center justify-between pt-6 md:flex">
        <a
          href="https://datos.gob.es/es/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          Datos: datos.gob.es
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
