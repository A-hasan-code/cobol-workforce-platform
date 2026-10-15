import { useState, useEffect } from "react";
import { Wordmark, Mark } from "./Logo.jsx";

const SAMPLE_EASY = `# Calculate compound interest
principal = 1000
rate = 5.5
years = 10

amount = principal * (1 + rate/100) ** years
print("Investment grows to:", amount)`;

const SAMPLE_COBOL = `IDENTIFICATION DIVISION.
PROGRAM-ID. INTEREST.
DATA DIVISION.
WORKING-STORAGE SECTION.
01  WS-PRINCIPAL    PIC 9(8)V99 VALUE 1000.
01  WS-RATE         PIC 9(3)V99 VALUE 5.50.
01  WS-YEARS        PIC 9(4)   VALUE 10.
01  WS-AMOUNT       PIC 9(12)V99.
PROCEDURE DIVISION.
    COMPUTE WS-AMOUNT = WS-PRINCIPAL *
        (1 + WS-RATE / 100) ** WS-YEARS
    DISPLAY "Investment grows to: " WS-AMOUNT
    STOP RUN.`;

export default function LandingPage({ go }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("both");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing">
      {/* Top Navigation */}
      <header className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <button type="button" className="landing-brand" onClick={() => go("/")}>
            <Wordmark />
          </button>
          <nav className="landing-nav-links">
            <button type="button" className="ghost" onClick={() => go("/playground")}>
              Playground
            </button>
            <button type="button" className="ghost" onClick={() => go("/converter")}>
              Converter
            </button>
            <button type="button" className="ghost" onClick={() => go("/compiler")}>
              Compiler Lab
            </button>
            <button type="button" className="ghost" onClick={() => go("/docs")}>
              Docs
            </button>
          </nav>
          <div className="landing-nav-actions">
            <button
              type="button"
              className="primary landing-cta-btn"
              onClick={() => go("/playground")}
            >
              Launch Studio →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span className="badge-pulse" />
          <span>The Next Generation COBOL Workforce Platform</span>
        </div>
        <h1 className="landing-title">
          Make Every Developer <br />
          <span className="gradient-text">COBOL-Capable</span>
        </h1>
        <p className="landing-subtitle">
          Write Python-simple EasyLang. Generate enterprise-grade, certified GnuCOBOL.
          Explore legacy estates, detect orphan code, and ship risk-gated changes safely —
          without rewriting the bank.
        </p>
        <div className="landing-cta-group">
          <button
            type="button"
            className="primary cta-large glow"
            onClick={() => go("/playground")}
          >
            Open Live Playground →
          </button>
          <button
            type="button"
            className="ghost cta-large"
            onClick={() => go("/converter")}
          >
            Try EasyLang Converter
          </button>
          <button
            type="button"
            className="ghost cta-large"
            onClick={() => go("/docs")}
          >
            Interactive Tutorial
          </button>
        </div>

        {/* Live Code Comparison Showcase */}
        <div className="landing-preview-wrapper">
          <div className="landing-preview-header">
            <div className="preview-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="preview-tabs">
              <button
                type="button"
                className={`preview-tab-btn ${activeTab === "both" ? "active" : ""}`}
                onClick={() => setActiveTab("both")}
              >
                Side-by-Side Dual Engine
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${activeTab === "easy" ? "active" : ""}`}
                onClick={() => setActiveTab("easy")}
              >
                EasyLang Source
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${activeTab === "cobol" ? "active" : ""}`}
                onClick={() => setActiveTab("cobol")}
              >
                GnuCOBOL Output
              </button>
            </div>
            <span className="preview-badge">Zero Mainframe Setup</span>
          </div>

          <div className={`landing-preview-grid tab-${activeTab}`}>
            {(activeTab === "both" || activeTab === "easy") && (
              <div className="preview-col easy-col">
                <div className="preview-col-hd">
                  <span className="col-tag easy-tag">EasyLang (What you write)</span>
                  <span className="col-sub">Python-like simplicity</span>
                </div>
                <pre className="preview-code">
                  <code>{SAMPLE_EASY}</code>
                </pre>
              </div>
            )}

            {activeTab === "both" && <div className="preview-divider">⇄</div>}

            {(activeTab === "both" || activeTab === "cobol") && (
              <div className="preview-col cobol-col">
                <div className="preview-col-hd">
                  <span className="col-tag cobol-tag">GnuCOBOL (What gets compiled)</span>
                  <span className="col-sub">Production-grade COBOL 85</span>
                </div>
                <pre className="preview-code">
                  <code>{SAMPLE_COBOL}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The Trillion Dollar Challenge */}
      <section className="landing-problem">
        <div className="landing-section-hd">
          <span className="section-kicker">The Global Challenge</span>
          <h2>The Infrastructure of World Commerce Runs on COBOL</h2>
          <p>
            Trillions of dollars move every single day through COBOL engines. But the engineers who
            built them are retiring, creating an urgent talent divide.
          </p>
        </div>

        <div className="landing-stats-grid">
          <div className="stat-card glass">
            <span className="stat-num gradient-text">800B+</span>
            <span className="stat-label">Lines of Active COBOL</span>
            <p>Powering commercial aviation, insurance claims, and global banking daily.</p>
          </div>
          <div className="stat-card glass">
            <span className="stat-num gradient-text">95%</span>
            <span className="stat-label">Of Global ATM Swipes</span>
            <p>Rely directly on COBOL programs running core ledger accounting.</p>
          </div>
          <div className="stat-card glass">
            <span className="stat-num gradient-text">~60 yrs</span>
            <span className="stat-label">Average Maintainer Age</span>
            <p>A generational cliff is approaching. We bridge it with modern tooling.</p>
          </div>
          <div className="stat-card glass">
            <span className="stat-num gradient-text">100%</span>
            <span className="stat-label">Local & Open Source</span>
            <p>Run locally with GnuCOBOL, Monaco Editor, and zero vendor lock-in.</p>
          </div>
        </div>
      </section>

      {/* Pillars / Features */}
      <section className="landing-features">
        <div className="landing-section-hd">
          <span className="section-kicker">Core Capabilities</span>
          <h2>An All-in-One Operating System for COBOL</h2>
          <p>
            From authoring to safety gates, COBOL Studio gives modern software teams the power to
            safely build, test, and maintain mission-critical systems.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">✨</div>
            <h3>EasyLang Transpiler</h3>
            <p>
              Write modern, expressive code with variables, math operators, functions, and records.
              Transpiles cleanly to readable, structured GnuCOBOL source.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">🔍</div>
            <h3>Estate Intelligence & Ghost Detection</h3>
            <p>
              Inspect copybooks, catalog program dependencies, identify orphaned procedures,
              and detect undocumented “ghost” logic before touching production.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">🛡️</div>
            <h3>Impact Analysis & Safety Gates</h3>
            <p>
              Know the blast radius of any field change before committing. Built-in CI safety gates
              flag high-risk modifications automatically.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">⚡</div>
            <h3>In-Browser Monaco Playground</h3>
            <p>
              Syntax highlighting, automatic indentation, live compilation, and test execution with
              real-time output console.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">📦</div>
            <h3>Enterprise Handoff Packs</h3>
            <p>
              One-click export of complete ZIP distribution bundles including verified .cob source,
              test proofs, step-by-step READMEs, and run artifacts.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">🎓</div>
            <h3>Interactive Learning Track</h3>
            <p>
              Learn COBOL through guided interactive lessons with immediate feedback. Type EasyLang,
              watch COBOL generate live, and run it in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="landing-workflow">
        <div className="landing-section-hd">
          <span className="section-kicker">The Workflow</span>
          <h2>From Modern Concept to Mainframe Ready in 3 Steps</h2>
        </div>

        <div className="workflow-steps">
          <div className="step-card glass">
            <span className="step-num">01</span>
            <h3>Write or Ingest</h3>
            <p>
              Write high-level logic in EasyLang or import existing COBOL files and copybooks from your
              repository.
            </p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card glass">
            <span className="step-num">02</span>
            <h3>Analyze & Test</h3>
            <p>
              Validate syntax, check impact analysis risk scores, and run automated unit tests with local
              GnuCOBOL.
            </p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card glass">
            <span className="step-num">03</span>
            <h3>Deploy with Proof</h3>
            <p>
              Generate a signed handoff pack with change reports and compilation logs ready for audit
              and bank review.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="landing-cta-banner glass">
        <div className="cta-banner-content">
          <h2>Ready to Modernize Your COBOL Workflow?</h2>
          <p>
            Experience the revolutionary developer environment designed for the next era of banking
            and enterprise systems.
          </p>
          <div className="cta-buttons">
            <button
              type="button"
              className="primary cta-large glow"
              onClick={() => go("/playground")}
            >
              Start in Studio Playground
            </button>
            <button
              type="button"
              className="ghost cta-large"
              onClick={() => go("/docs")}
            >
              Explore Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <Mark size={24} />
            <span className="footer-name">COBOL Studio</span>
            <span className="footer-copy">
              © {new Date().getFullYear()} Modern COBOL Platform. Open Source.
            </span>
          </div>
          <div className="footer-links">
            <button type="button" className="ghost link-btn" onClick={() => go("/playground")}>
              Playground
            </button>
            <button type="button" className="ghost link-btn" onClick={() => go("/converter")}>
              Converter
            </button>
            <button type="button" className="ghost link-btn" onClick={() => go("/compiler")}>
              Compiler Lab
            </button>
            <button type="button" className="ghost link-btn" onClick={() => go("/docs")}>
              Documentation
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
