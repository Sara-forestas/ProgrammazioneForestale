import React, { useState } from "react";
import costoStandardData from "../costi_standard.json";
import "../styles/forms.css";
import "../styles/tabelle.css";
import "../styles/buttons.css";

export default function ProgrammaEsecutivo() {
  const [selected, setSelected] = useState(null);
  const [descrizione, setDescrizione] = useState("");
  const [tipo, setTipo] = useState("");
  const [quantita, setQuantita] = useState(1);
  const [esecuzione, setEsecuzione] = useState("");
  const [righe, setRighe] = useState([]);

  const currencyFormatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  });

  const handleSelect = (code) => {
    const az = costoStandardData.find((a) => a.azioneOperativa === code);
    setSelected(az || null);
    setDescrizione("");
    setTipo("");
    setQuantita(1);
    setEsecuzione("");
  };

  const calcolaValore = (base) =>
    quantita && !isNaN(quantita) ? base * parseInt(quantita) : 0;

  const costoTotale =
    (selected ? calcolaValore(selected.personale) : 0) +
    (selected ? calcolaValore(selected.materiali) : 0) +
    (selected ? calcolaValore(selected.carburanti || 0) : 0) +
    (selected ? calcolaValore(selected.noli) : 0);

  const aggiungiRiga = () => {
    if (!selected) return;
    const nuovaRiga = {
      azioneOperativa: selected.azioneOperativa,
      descrizioneIntervento: descrizione,
      tipo,
      um: selected.um,
      quantita,
      esecuzione,
      personale: calcolaValore(selected.personale),
      materiali: calcolaValore(selected.materiali),
      carburanti: calcolaValore(selected.carburanti || 0),
      noli: calcolaValore(selected.noli),
      costoTotale,
    };
    setRighe([...righe, nuovaRiga]);
  };

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Azione Operativa</label>
        <select
          className="form-select"
          onChange={(e) => handleSelect(e.target.value)}
          value={selected?.azioneOperativa || ""}
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
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Descrizione sintetica</label>
            <input
              type="text"
              className="form-input"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo</label>
            <input
              type="text"
              className="form-input"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quantità ({selected.um})</label>
            <input
              type="number"
              min="1"
              step="1"
              className="form-input"
              value={quantita}
              onChange={(e) => setQuantita(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Esecuzione</label>
            <input
              type="text"
              className="form-input"
              value={esecuzione}
              onChange={(e) => setEsecuzione(e.target.value)}
            />
          </div>

          <p><strong>Costo Totale:</strong> {currencyFormatter.format(costoTotale)}</p>

          <button className="btn" onClick={aggiungiRiga}>
            ➕ Aggiungi alla tabella
          </button>
        </div>
      )}

      {righe.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Azione</th>
              <th>Descrizione</th>
              <th>Tipo</th>
              <th>UM</th>
              <th>Q</th>
              <th>Esecuzione</th>
              <th>Personale</th>
              <th>Materiali</th>
              <th>Carburanti</th>
              <th>Noli</th>
              <th>Totale</th>
            </tr>
          </thead>
          <tbody>
            {righe.map((r, i) => (
              <tr key={i}>
                <td>{r.azioneOperativa}</td>
                <td>{r.descrizioneIntervento}</td>
                <td>{r.tipo}</td>
                <td>{r.um}</td>
                <td>{r.quantita}</td>
                <td>{r.esecuzione}</td>
                <td>{currencyFormatter.format(r.personale)}</td>
                <td>{currencyFormatter.format(r.materiali)}</td>
                <td>{currencyFormatter.format(r.carburanti)}</td>
                <td>{currencyFormatter.format(r.noli)}</td>
                <td className="totale">{currencyFormatter.format(r.costoTotale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
