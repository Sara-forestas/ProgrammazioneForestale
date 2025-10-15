import React, { useState } from "react";
import costoStandardData from "../costi_standard.json";
import "../styles/forms.css";
import "../styles/tabelle.css";

export default function AzioniOperative() {
  const [selected, setSelected] = useState(null);

  const currencyFormatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  });

  const handleSelect = (code) => {
    const az = costoStandardData.find((a) => a.azioneOperativa === code);
    setSelected(az || null);
  };

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Azione Operativa</label>
        <select
          className="form-select"
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">-- Seleziona Azione --</option>
          {costoStandardData.map((a, i) => (
            <option key={i} value={a.azioneOperativa}>
              {a.azioneOperativa} - {a.descrizione}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <table className="table">
          <thead>
            <tr>
              <th>UM</th>
              <th>Personale</th>
              <th>Materiali</th>
              <th>Noli</th>
              <th>Totale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selected.um}</td>
              <td>{currencyFormatter.format(selected.personale)}</td>
              <td>{currencyFormatter.format(selected.materiali)}</td>
              <td>{currencyFormatter.format(selected.noli)}</td>
              <td className="totale">
                {currencyFormatter.format(selected.costoTotale)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
