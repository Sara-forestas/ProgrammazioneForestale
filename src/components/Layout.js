import React from "react";
import Pianificazione from "./Pianificazione";
import AzioniOperative from "./AzioniOperative";
import ProgrammaEsecutivo from "./ProgrammaEsecutivo";

import "../styles/layout.css"; 
import "../styles/buttons.css"; 
import "../styles/tabelle.css"; 

export default function Layout() {
  return (
    <div className="container">
      <div className="card">
        <h2>Pianificazione Forestale</h2>
        <Pianificazione />
      </div>

      <div className="card">
        <h2>Azioni Operative</h2>
        <AzioniOperative />
      </div>

      <div className="card">
        <h2>Programma Esecutivo</h2>
        <ProgrammaEsecutivo />
      </div>
    </div>
  );
}
