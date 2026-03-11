import React from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18/client";
import htm from "https://esm.sh/htm@3.1.1/react";
import App from "./App.jsx";

const html = htm.bind(React.createElement);

ReactDOM.createRoot(document.getElementById("root")).render(
  html`<${App} />`
);
