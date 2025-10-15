import React from "react";
import Pianificazione from "./components/Pianificazione";
import AzioniOperative from "./components/AzioniOperative";
import ProgrammaEsecutivo from "./components/ProgrammaEsecutivo";
import "./App.css";


function App() {
  return (
    <div className="App">
      <div>
        <Pianificazione />
      </div>
      <div>
        <AzioniOperative />
      </div>
          <div>
        <ProgrammaEsecutivo />
      </div>
    </div>
  );
}

export default App;
