import { useEffect, useState } from "react";
import App from "./App.jsx";
import LandingPage from "./LandingPage.jsx";
import DocsPage from "./DocsPage.jsx";
import CompilerPage from "./CompilerPage.jsx";
import ConverterPage from "./ConverterPage.jsx";

function currentPath() {
  const p = window.location.pathname.replace(/\/$/, "") || "/";
  if (p.startsWith("/docs")) return "/docs";
  if (p.startsWith("/compiler")) return "/compiler";
  if (p.startsWith("/converter")) return "/converter";
  if (p.startsWith("/playground")) return "/playground";
  return "/";
}

export default function Root() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(to) {
    if (to.startsWith("/docs")) {
      const url = to.includes("#") ? to : "/docs#welcome";
      window.history.pushState({}, "", url);
      setPath("/docs");
      return;
    }
    if (to.startsWith("/compiler")) {
      window.history.pushState({}, "", "/compiler");
      setPath("/compiler");
      return;
    }
    if (to.startsWith("/converter")) {
      window.history.pushState({}, "", "/converter");
      setPath("/converter");
      return;
    }
    if (to.startsWith("/playground")) {
      window.history.pushState({}, "", "/playground");
      setPath("/playground");
      return;
    }
    window.history.pushState({}, "", "/");
    setPath("/");
  }

  if (path === "/docs") {
    return <DocsPage go={go} />;
  }
  if (path === "/compiler") {
    return <CompilerPage go={go} />;
  }
  if (path === "/converter") {
    return <ConverterPage go={go} />;
  }
  if (path === "/playground") {
    return <App go={go} />;
  }

  return <LandingPage go={go} />;
}
