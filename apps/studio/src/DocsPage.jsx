import { useEffect, useMemo, useState } from "react";
import { Wordmark } from "./Logo.jsx";
import { DOCS_SECTIONS, renderSection } from "./docsContent.js";
import TryLesson from "./TryLesson.jsx";

function Block({ block }) {
  switch (block.type) {
    case "lead":
      return <p className="docs-lead">{block.text}</p>;
    case "p":
      return <p className="docs-p">{block.text}</p>;
    case "callout":
      return (
        <aside className={`docs-callout ${block.tone || ""}`}>
          <strong>{block.title}</strong>
          <p>{block.text}</p>
        </aside>
      );
    case "steps":
      return (
        <div className="docs-steps">
          <h3>{block.title}</h3>
          <ol>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      );
    case "bullets":
      return (
        <ul className="docs-bullets">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "analogy":
      return (
        <aside className="docs-analogy">
          <span className="docs-kicker">Picture this</span>
          <strong>{block.title}</strong>
          <p>{block.text}</p>
        </aside>
      );
    case "cards":
      return (
        <div className="docs-cards">
          {block.items.map((c) => (
            <article key={c.title} className="docs-card">
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      );
    case "mini":
      return (
        <div className="docs-mini">
          <h3>{block.title}</h3>
          <pre>{block.code}</pre>
          <p>{block.note}</p>
        </div>
      );
    case "try":
      return (
        <TryLesson
          title={block.title || "Try it here"}
          mode={block.mode || "easy"}
          easy={block.easy || ""}
          cobol={block.cobol || ""}
          note={block.note || ""}
          programId={block.programId || "DOCTRY"}
        />
      );
    case "problem":
      return (
        <div className="docs-problem">
          <h3>{block.title}</h3>
          <div className="docs-problem-grid">
            {block.items.map((it) => (
              <article key={it.name}>
                <h4>{it.name}</h4>
                <p>{it.text}</p>
              </article>
            ))}
          </div>
        </div>
      );
    case "do-dont":
      return (
        <div className="docs-dodont">
          <div>
            <h3>Do</h3>
            <ul>
              {block.dos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Don’t</h3>
            <ul>
              {block.donts.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    case "glossary":
      return (
        <dl className="docs-glossary">
          {block.items.map((g) => (
            <div key={g.term} className="docs-gloss-row">
              <dt>{g.term}</dt>
              <dd>{g.def}</dd>
            </div>
          ))}
        </dl>
      );
    default:
      return null;
  }
}

export default function DocsPage({ go }) {
  const [sectionId, setSectionId] = useState("welcome");
  const [search, setSearch] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  const section = useMemo(() => renderSection(sectionId), [sectionId]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (DOCS_SECTIONS.some((s) => s.id === hash)) setSectionId(hash);
      else if (!hash) setSectionId("welcome");
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress((window.scrollY / total) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function select(id) {
    setSectionId(id);
    window.history.replaceState({}, "", `/docs#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredSections = useMemo(() => {
    if (!search.trim()) return DOCS_SECTIONS;
    const q = search.toLowerCase();
    return DOCS_SECTIONS.filter(
      (s) => s.nav.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [search]);

  const idx = DOCS_SECTIONS.findIndex((s) => s.id === sectionId);
  const prev = idx > 0 ? DOCS_SECTIONS[idx - 1] : null;
  const next = idx < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[idx + 1] : null;

  return (
    <div className="docs-app">
      <div className="docs-progress-bar" style={{ width: `${scrollProgress}%` }} />
      <header className="docs-chrome">
        <button type="button" className="docs-brand-btn" onClick={() => go("/")} title="Back to Home">
          <Wordmark />
        </button>
        <nav className="docs-chrome-nav" aria-label="Site">
          <button type="button" className="ghost" onClick={() => go("/")}>
            Home
          </button>
          <button type="button" className="ghost" onClick={() => go("/playground")}>
            Playground
          </button>
          <button type="button" className="ghost" onClick={() => go("/converter")}>
            Converter
          </button>
          <button type="button" className="ghost" onClick={() => go("/compiler")}>
            Compiler
          </button>
          <button type="button" className="primary" aria-current="page">
            Docs
          </button>
        </nav>
      </header>

      <div className="docs-shell">
        <aside className="docs-nav island" aria-label="Topics">
          <div className="island-hd">
            <h2>Learn</h2>
            <span className="meta">{filteredSections.length} topics</span>
          </div>

          <div className="docs-search-box">
            <input
              type="search"
              className="docs-search-input"
              placeholder="Filter topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filter documentation topics"
            />
          </div>

          <ol className="docs-toc">
            {filteredSections.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={s.id === sectionId ? "active" : ""}
                  onClick={() => select(s.id)}
                >
                  <span className="docs-toc-num">{String(i + 1).padStart(2, "0")}</span>
                  {s.nav}
                </button>
              </li>
            ))}
            {filteredSections.length === 0 && (
              <li className="docs-toc-empty">No topics matching "{search}"</li>
            )}
          </ol>
        </aside>

        <article className="docs-main island" key={sectionId}>
          <header className="docs-main-hd">
            <p className="docs-eyebrow">COBOL Studio Docs</p>
            <h1>{section.title}</h1>
          </header>
          <div className="docs-main-body">
            {section.blocks.map((b, i) => (
              <Block key={`${sectionId}-${i}`} block={b} />
            ))}
          </div>
          <footer className="docs-pager">
            {prev ? (
              <button type="button" className="ghost" onClick={() => select(prev.id)}>
                ← {prev.nav}
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button type="button" className="primary" onClick={() => select(next.id)}>
                {next.nav} →
              </button>
            ) : (
              <button type="button" className="primary" onClick={() => go("/playground")}>
                Open Studio Playground →
              </button>
            )}
          </footer>
        </article>
      </div>
    </div>
  );
}
