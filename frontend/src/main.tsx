import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { XcTopAverage } from "./pages/TopFiveAverage.tsx";
import { Athlete } from "./pages/Athlete.tsx";
import { BackToSite } from "./components/BackToSite.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/tfrrs">
    <BackToSite />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/fastestAvg" element={<XcTopAverage />} />
      <Route path="/:athleteId" element={<Athlete />} />
    </Routes>
  </BrowserRouter>,
);
