import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import "./index.css";
import AppWrapper from "./AppWrapper";
import { AuthProvider } from "./context/AuthContext";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#b25d2f",
          colorInfo: "#b25d2f",
          colorSuccess: "#7b8f3a",
          colorWarning: "#b8782f",
          colorError: "#b2483a",
          borderRadius: 12,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
      }}
    >
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>,
);

reportWebVitals();
