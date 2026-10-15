/** Brand mark: ledger columns + C — readable at 16–32px with modern glow ring. */
export function Mark({ size = 28, title = "COBOL Studio" }) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="markGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="#111827" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="5" y="8" width="1.75" height="16" rx="0.5" fill="#64748b" />
      <rect x="8.5" y="8" width="1.75" height="16" rx="0.5" fill="url(#markGrad)" />
      <path
        d="M22.8 10.6c-1.1-1.2-2.7-1.9-4.6-1.9-3.7 0-6.3 2.7-6.3 7.3s2.6 7.3 6.3 7.3c1.9 0 3.5-.7 4.6-1.9l-1.4-1.3c-.8.8-1.9 1.3-3.2 1.3-2.4 0-4.1-1.8-4.1-5.4s1.7-5.4 4.1-5.4c1.3 0 2.4.5 3.2 1.3l1.4-1.3z"
        fill="#f8fafc"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="brand-lockup">
      <Mark />
      <div className="brand-text">
        <span className="brand-name">COBOL Studio</span>
        <span className="brand-tag">The Modern COBOL Platform</span>
      </div>
    </div>
  );
}

export function FileIcon({ path }) {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const kind =
    ext === "cob" || ext === "cbl"
      ? "cob"
      : ext === "cpy"
        ? "cpy"
        : ext === "md"
          ? "md"
          : ext === "toml"
            ? "toml"
            : ext === "in" || ext === "out"
              ? "data"
              : "file";

  const fill =
    kind === "cob"
      ? "#3b82f6"
      : kind === "cpy"
        ? "#10b981"
        : kind === "md"
          ? "#eab308"
          : kind === "toml"
            ? "#94a3b8"
            : kind === "data"
              ? "#f97316"
              : "#64748b";

  return (
    <svg className="file-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 1.5h6l3 3V14.5h-9z"
        fill="#1e293b"
        stroke={fill}
        strokeWidth="1.2"
      />
      <path d="M9.5 1.5v3h3" fill="none" stroke={fill} strokeWidth="1.2" />
      <rect x="5" y="8.5" width="6" height="1.2" rx="0.4" fill={fill} />
      <rect x="5" y="11" width="4" height="1.2" rx="0.4" fill={fill} opacity="0.8" />
    </svg>
  );
}
