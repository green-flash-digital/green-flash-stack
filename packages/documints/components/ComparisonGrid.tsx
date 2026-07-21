import { useState, type CSSProperties } from "react";

/* ------------------------------------------------------------------ *
 * Documints comparison grid — standalone React component.
 * No external deps. Fonts (Space Grotesk, IBM Plex Sans, IBM Plex Mono)
 * should be loaded globally, e.g. in your <head> or layout.
 * ------------------------------------------------------------------ */

type Status = "built" | "plugin" | "custom" | "managed" | "none";
type Cell = { t: string } | { s: Status; d?: string };
type Row = {
  key: string;
  cap: string;
  mono?: boolean;
  term?: string;
  tip?: string;
  note: string;
  cells: Cell[]; // length 5, order: Documints, Docusaurus, VitePress, Starlight, Mintlify
};

export type ComparisonGridProps = {
  accentHue?: number; // default 172
  highlightDocumints?: boolean; // default true
  compact?: boolean; // default false
};

const PRODUCTS = [
  { name: "Documints", label: "Document-native infrastructure", isDoc: true },
  { name: "Docusaurus", label: "Extensible React docs framework" },
  { name: "VitePress", label: "Streamlined Vue docs framework" },
  { name: "Starlight", label: "Astro-powered docs framework" },
  { name: "Mintlify", label: "Managed knowledge platform" }
];

const ROWS: Row[] = [
  {
    key: "framework",
    cap: "Framework",
    mono: true,
    note: "Everyone builds on a rendering framework. Documints builds on a document model, so every output — HTML, Markdown, JSON — is derived from one source rather than produced by one framework.",
    cells: [
      { t: "Document-native" },
      { t: "React" },
      { t: "Vue + Vite" },
      { t: "Astro" },
      { t: "Managed platform" }
    ]
  },
  {
    key: "routing",
    cap: "Routing and hierarchy",
    note: "File and folder structure drives the navigation tree in all five tools. This is table stakes, and everyone does it well.",
    cells: [
      { s: "built", d: "File-based" },
      { s: "built", d: "File-based" },
      { s: "built", d: "File-based" },
      { s: "built", d: "File-based" },
      { s: "built", d: "Config-driven" }
    ]
  },
  {
    key: "beside",
    cap: "Docs can live beside code",
    note: "Repository-owned source keeps documentation versioned alongside the code it describes, so docs move with the codebase.",
    cells: [
      { s: "built" },
      { s: "built" },
      { s: "built" },
      { s: "built" },
      { s: "built", d: "Git-synced" }
    ]
  },
  {
    key: "custom",
    cap: "Full custom page authoring",
    note: "Each tool lets you break out of Markdown for bespoke pages using its own component model — plain HTML in Documints, framework components elsewhere.",
    cells: [
      { s: "built", d: "HTML" },
      { s: "built", d: "React / MDX" },
      { s: "built", d: "Vue" },
      { s: "built", d: "Astro / MDX" },
      { s: "built", d: "MDX" }
    ]
  },
  {
    key: "rawmd",
    cap: "Raw Markdown page",
    note: "Serving the original Markdown at a stable URL beside the rendered HTML — a first-class output in Documints, an add-on or manual step elsewhere.",
    cells: [
      { s: "built", d: "/page.md" },
      { s: "plugin" },
      { s: "custom" },
      { s: "custom" },
      { s: "none" }
    ]
  },
  {
    key: "jsonpage",
    cap: "Structured JSON page",
    note: "A machine-readable JSON representation of each page, emitted from the same document model so it never drifts from the rendered page.",
    cells: [
      { s: "built", d: "/page.json" },
      { s: "custom" },
      { s: "custom" },
      { s: "custom" },
      { s: "none" }
    ]
  },
  {
    key: "manifest",
    cap: "Site-wide machine-readable manifest",
    term: "docs-manifest.json",
    tip: "A single site-wide index of every page and its outputs, generated at build time so machines can traverse the whole corpus without scraping HTML.",
    note: "One generated index of the entire corpus — pages, formats, and metadata — that other systems read directly. In most frameworks this is a plugin or hand-built artifact.",
    cells: [
      { s: "built", d: "docs-manifest.json" },
      { s: "plugin" },
      { s: "custom" },
      { s: "custom" },
      { s: "managed" }
    ]
  },
  {
    key: "ai",
    cap: "AI discovery",
    term: "/.well-known/documints.json",
    tip: "A standard discovery endpoint that lets AI agents locate the manifest and traverse the corpus without guesswork.",
    note: "A well-known endpoint plus llms-style outputs let agents find and read the docs as data, not as rendered pages — part of the core in Documints.",
    cells: [
      { s: "built", d: ".well-known" },
      { s: "plugin" },
      { s: "custom" },
      { s: "plugin" },
      { s: "managed" }
    ]
  },
  {
    key: "search",
    cap: "Search",
    note: "All five offer search; the difference is where the index lives and who operates it — static and self-owned, self-hosted service, or fully managed.",
    cells: [
      { s: "built", d: "Static index" },
      { s: "plugin", d: "Algolia" },
      { s: "built", d: "Local" },
      { s: "built", d: "Pagefind" },
      { s: "managed", d: "Hosted + AI" }
    ]
  },
  {
    key: "hosting",
    cap: "Hosting",
    note: "Static output runs anywhere; a managed platform trades portability for a hosted, batteries-included experience.",
    cells: [
      { t: "Any static host" },
      { t: "Any static host" },
      { t: "Any static host" },
      { t: "Any static host" },
      { t: "Managed hosting" }
    ]
  },
  {
    key: "plugins",
    cap: "Plugin ecosystem",
    note: "Extensibility is a genuine strength of the mature frameworks. Documints deliberately keeps a small, focused core rather than a broad plugin surface.",
    cells: [
      { s: "custom", d: "Focused core" },
      { s: "built", d: "Extensive" },
      { s: "built", d: "Growing" },
      { s: "built", d: "Astro integrations" },
      { s: "managed", d: "Platform features" }
    ]
  },
  {
    key: "bestfit",
    cap: "Best fit",
    note: "Every one of these is a strong choice — for a different kind of team and a different set of priorities.",
    cells: [
      { t: "Teams that want a repository-owned corpus for humans, machines, and AI" },
      { t: "Large React teams needing deep extensibility" },
      { t: "Vue teams wanting a fast, simple site" },
      { t: "Astro teams wanting a polished docs site" },
      { t: "Teams wanting a managed, hands-off platform" }
    ]
  }
];

const STATUS_META: Record<Status, { label: string; tone: string }> = {
  built: { label: "Built in", tone: "mint" },
  plugin: { label: "Plugin", tone: "amber" },
  custom: { label: "Custom work", tone: "neutral" },
  managed: { label: "Managed", tone: "blue" },
  none: { label: "Not offered", tone: "off" }
};

const CAPW = 236;
const COLMIN = 176;

export function ComparisonGrid({
  accentHue = 172,
  highlightDocumints = true,
  compact = false
}: ComparisonGridProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  const hue = accentHue;
  const m = (l: number, c: number, a?: number) =>
    `oklch(${l} ${c} ${hue}${a != null ? ` / ${a}` : ""})`;

  const tones: Record<string, { fg: string; bg: string; bd: string }> = {
    mint: { fg: m(0.9, 0.13), bg: m(0.9, 0.13, 0.14), bd: m(0.9, 0.13, 0.34) },
    amber: {
      fg: "oklch(0.85 0.08 75)",
      bg: "oklch(0.85 0.08 75 / 0.12)",
      bd: "oklch(0.85 0.08 75 / 0.26)"
    },
    blue: {
      fg: "oklch(0.8 0.08 250)",
      bg: "oklch(0.8 0.08 250 / 0.12)",
      bd: "oklch(0.8 0.08 250 / 0.26)"
    },
    neutral: {
      fg: "oklch(0.76 0.008 250)",
      bg: "rgba(255,255,255,0.05)",
      bd: "rgba(255,255,255,0.12)"
    },
    off: { fg: "oklch(0.56 0.006 250)", bg: "transparent", bd: "rgba(255,255,255,0.08)" }
  };

  const cellPad = compact ? "11px 15px" : "15px 16px";
  const headPad = compact ? "16px 15px 13px" : "20px 16px 15px";
  const capPad = compact ? "11px 18px" : "15px 18px";

  const renderCell = (c: Cell, i: number, row: Row) => {
    const isDoc = i === 0 && highlightDocumints;
    const cHover = hoveredCol === i;
    const dim = hoveredCol != null && !cHover && !isDoc;
    let bg = "transparent";
    if (isDoc) bg = hoveredRow === row.key || cHover ? m(0.9, 0.13, 0.11) : m(0.9, 0.13, 0.055);
    else if (cHover) bg = "rgba(255,255,255,0.05)";
    else if (hoveredRow === row.key) bg = "rgba(255,255,255,0.028)";

    const wrap: CSSProperties = {
      flex: `1 1 ${COLMIN}px`,
      minWidth: COLMIN,
      padding: cellPad,
      display: "flex",
      flexDirection: "column",
      gap: 5,
      justifyContent: "center",
      background: bg,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      borderLeft: isDoc ? `1px solid ${m(0.9, 0.13, 0.26)}` : "1px solid transparent",
      borderRight: isDoc ? `1px solid ${m(0.9, 0.13, 0.26)}` : "1px solid transparent",
      opacity: dim ? 0.5 : 1,
      transition: "background .18s ease, opacity .18s ease"
    };

    if ("t" in c) {
      return (
        <div key={i} style={wrap}>
          <span
            style={{
              fontSize: row.key === "bestfit" ? 13 : 13.5,
              lineHeight: 1.42,
              color: isDoc ? "#eaf0ee" : dim ? "oklch(0.62 0.006 250)" : "oklch(0.82 0.006 250)",
              fontWeight: isDoc ? 500 : 400,
              fontFamily: row.mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif"
            }}
          >
            {c.t}
          </span>
        </div>
      );
    }
    const mt = STATUS_META[c.s],
      tn = tones[mt.tone];
    return (
      <div key={i} style={wrap}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            alignSelf: "flex-start",
            padding: "5px 10px 5px 9px",
            borderRadius: 7,
            background: tn.bg,
            border: `1px solid ${tn.bd}`,
            color: tn.fg,
            fontSize: 12.5,
            fontWeight: 500,
            whiteSpace: "nowrap"
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: tn.fg,
              opacity: c.s === "none" ? 0.4 : 0.95,
              flex: "none"
            }}
          />
          {mt.label}
        </span>
        {c.d && (
          <span
            style={{
              fontSize: 11.5,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "-0.01em",
              color: dim ? "oklch(0.5 0.006 250)" : "oklch(0.6 0.006 250)"
            }}
          >
            {c.d}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background:
          "radial-gradient(1200px 480px at 50% -8%, oklch(0.9 0.13 172 / 0.06), transparent 70%)",
        padding: "72px 28px 96px",
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: "#e8ebed"
      }}
    >
      <div style={{ maxWidth: 1260, margin: "0 auto" }}>
        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 16px",
            alignItems: "center",
            marginBottom: 18
          }}
        >
          {(Object.keys(STATUS_META) as Status[]).map((k) => {
            const mt = STATUS_META[k],
              tn = tones[mt.tone];
            return (
              <span
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "5px 11px 5px 9px",
                  borderRadius: 7,
                  background: tn.bg,
                  border: `1px solid ${tn.bd}`,
                  color: tn.fg,
                  fontSize: 12.5,
                  fontWeight: 500,
                  whiteSpace: "nowrap"
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: tn.fg,
                    opacity: k === "none" ? 0.4 : 0.95,
                    flex: "none"
                  }}
                />
                {mt.label}
              </span>
            );
          })}
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12.5,
              color: "oklch(0.55 0.006 250)",
              fontFamily: "'IBM Plex Mono', monospace"
            }}
          >
            Hover to focus · click a row for the architectural note
          </span>
        </div>

        {/* Grid */}
        <div
          style={{
            overflow: "auto",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 16,
            background: "linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0.004))",
            boxShadow: "0 30px 80px -40px rgba(0,0,0,0.8)"
          }}
        >
          <div style={{ minWidth: 1116 }}>
            {/* Header row */}
            <div
              style={{
                display: "flex",
                position: "sticky",
                top: 0,
                zIndex: 5,
                background: "rgba(13,16,17,0.97)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div
                style={{
                  position: "sticky",
                  left: 0,
                  zIndex: 6,
                  flex: `0 0 ${CAPW}px`,
                  width: CAPW,
                  padding: "20px 18px 16px",
                  display: "flex",
                  alignItems: "flex-end",
                  background: "rgba(13,16,17,0.99)",
                  borderBottom: "1px solid rgba(255,255,255,0.09)",
                  borderRight: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "oklch(0.55 0.006 250)"
                  }}
                >
                  Capability
                </span>
              </div>
              {PRODUCTS.map((p, i) => {
                const isDoc = !!p.isDoc && highlightDocumints;
                const emph = hoveredCol === i || isDoc;
                const dim = hoveredCol != null && hoveredCol !== i && !isDoc;
                return (
                  <div
                    key={p.name}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                    style={{
                      flex: `1 1 ${COLMIN}px`,
                      minWidth: COLMIN,
                      padding: headPad,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      gap: 3,
                      borderBottom: "1px solid rgba(255,255,255,0.09)",
                      transition: "background .18s ease, opacity .18s ease",
                      opacity: dim ? 0.58 : 1,
                      background: isDoc
                        ? m(0.9, 0.13, 0.1)
                        : emph
                          ? "rgba(255,255,255,0.04)"
                          : "transparent",
                      borderLeft: isDoc
                        ? `1px solid ${m(0.9, 0.13, 0.3)}`
                        : "1px solid transparent",
                      borderRight: isDoc
                        ? `1px solid ${m(0.9, 0.13, 0.3)}`
                        : "1px solid transparent",
                      boxShadow: isDoc ? `inset 0 2px 0 ${m(0.9, 0.13, 0.55)}` : "none"
                    }}
                  >
                    {isDoc && (
                      <span
                        style={{
                          position: "absolute",
                          top: 9,
                          left: 16,
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: m(0.85, 0.11)
                        }}
                      >
                        Different foundation
                      </span>
                    )}
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 17,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        color: dim ? "oklch(0.7 0.006 250)" : isDoc ? "#f2f6f5" : "#eef1f2"
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        lineHeight: 1.35,
                        marginTop: 3,
                        color: isDoc
                          ? m(0.82, 0.09)
                          : dim
                            ? "oklch(0.5 0.006 250)"
                            : "oklch(0.66 0.006 250)"
                      }}
                    >
                      {p.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Body rows */}
            {ROWS.map((row) => {
              const isExp = !!expanded[row.key];
              const rHover = hoveredRow === row.key;
              return (
                <div key={row.key}>
                  <div
                    onMouseEnter={() => setHoveredRow(row.key)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => setExpanded((s) => ({ ...s, [row.key]: !s[row.key] }))}
                    style={{ display: "flex", alignItems: "stretch", cursor: "pointer" }}
                  >
                    <div
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        flex: `0 0 ${CAPW}px`,
                        width: CAPW,
                        padding: capPad,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        justifyContent: "center",
                        background: rHover ? "rgba(24,28,30,0.98)" : "rgba(12,14,15,0.97)",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                        backdropFilter: "blur(6px)",
                        transition: "background .18s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            color: rHover ? "#f2f5f5" : "#d6dbdc"
                          }}
                        >
                          {row.cap}
                        </span>
                        {row.term && (
                          <span
                            onMouseEnter={(e) =>
                              row.tip && setTip({ text: row.tip, x: e.clientX, y: e.clientY })
                            }
                            onMouseLeave={() => setTip(null)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              flex: "none",
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "1px solid rgba(255,255,255,0.22)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontStyle: "italic",
                              fontFamily: "'IBM Plex Mono', monospace",
                              color: "oklch(0.66 0.006 250)",
                              cursor: "help"
                            }}
                          >
                            i
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontFamily: "'IBM Plex Mono', monospace",
                          letterSpacing: "0.02em",
                          color: isExp ? m(0.8, 0.09) : "oklch(0.5 0.006 250)",
                          transition: "color .18s ease"
                        }}
                      >
                        ▾ Architecture
                      </span>
                    </div>
                    {row.cells.map((c, i) => renderCell(c, i, row))}
                  </div>
                  {isExp && (
                    <div
                      style={{
                        padding: "14px 24px 16px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        borderLeft: `2px solid ${m(0.88, 0.12)}`,
                        background: "rgba(255,255,255,0.022)",
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        color: "oklch(0.74 0.006 250)",
                        maxWidth: 860,
                        position: "sticky",
                        left: 0
                      }}
                    >
                      {row.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p
          style={{
            margin: "20px 2px 0",
            fontSize: 12.5,
            color: "oklch(0.5 0.006 250)",
            fontFamily: "'IBM Plex Mono', monospace"
          }}
        >
          Each tool is a credible fit for a different kind of team. This grid shows tradeoffs, not a
          scoreboard.
        </p>
      </div>

      {tip && (
        <div
          style={{
            position: "fixed",
            left: Math.max(
              150,
              Math.min(tip.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 150)
            ),
            top: tip.y + 18,
            transform: "translateX(-50%)",
            maxWidth: 270,
            zIndex: 1000,
            padding: "11px 14px",
            borderRadius: 10,
            background: "rgba(18,22,24,0.98)",
            border: `1px solid ${m(0.9, 0.13, 0.28)}`,
            boxShadow: "0 18px 40px -18px rgba(0,0,0,0.9)",
            color: "oklch(0.86 0.006 250)",
            fontSize: 12.5,
            lineHeight: 1.5,
            pointerEvents: "none",
            backdropFilter: "blur(8px)"
          }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
