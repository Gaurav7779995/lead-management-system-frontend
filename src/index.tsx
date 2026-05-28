import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if (process.env.NODE_ENV === "production") {
  const noop = () => undefined;
  const methods = [
    "log",
    "debug",
    "info",
    "warn",
    "error",
    "trace",
    "table",
    "group",
    "groupCollapsed",
    "groupEnd",
  ] as const;

  methods.forEach((method) => {
    console[method] = noop as never;
  });
}

const rootElement = document.getElementById("root") as HTMLElement;

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
