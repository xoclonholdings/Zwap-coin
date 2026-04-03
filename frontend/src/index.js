import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import PrivyProviderWrapper from "./app/PrivyProviderWrapper";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <PrivyProviderWrapper>
      <App />
    </PrivyProviderWrapper>
  </React.StrictMode>
);