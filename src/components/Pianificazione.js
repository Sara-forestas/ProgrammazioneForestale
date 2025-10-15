import React, { useState, useEffect } from "react";
import data from "../data/output_flat.json";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";

const Pianificazione = () => {
  // ================= STATE =================
  const [missioni, setMissioni] = useState([]);
  const [programmi, setProgrammi] = useState([]);
  const [osList, setOsList] = useState([]);
  const [odList, setOdList] = useState([]);
  const [ogList, setOgList] = useState([]);

  const [selectedMissione, setSelectedMissione] = useState("");
  const [selectedProgramma, setSelectedProgramma] = useState("");
  const [selectedOS, setSelectedOS] = useState("");
  const [selectedOD, setSelectedOD] = useState("");
  const [selectedOG, setSelectedOG] = useState("");

  const [cdrList, setCdrList] = useState([]);
  const [selectedCdr, setSelectedCdr] = useState("");
  const [cdrCompetente, setCdrCompetente] = useState("");
  const [codiceCdR, setCodiceCdR] = useState("");
  const [codiceSAP, setCodiceSAP] = useState("");

  const [tipoDocumento, setTipoDocumento] = useState("");
  const [altroTipo, setAltroTipo] = useState("");
  const [dataDocumento, setDataDocumento] = useState("");
  const [descrizioneDocumento, setDescrizioneDocumento] = useState("");

  const [righe, setRighe] = useState([]);

  // ================= HELPERS =================
  const norm = (v) => (v ?? "").toString().trim().toLowerCase();

  const findMatchingRows = () => {
    return data.filter((d) => {
      if (selectedMissione && norm(d.Missione) !== norm(selectedMissione))
        return false;
      if (selectedProgramma && norm(d.Programma) !== norm(selectedProgramma))
        return false;
      if (selectedOS && norm(d.ObiettivoStrategico) !== norm(selectedOS))
        return false;
      if (selectedOD && norm(d.ObiettivoDirezionale) !== norm(selectedOD))
        return false;
      if (selectedOG && norm(d.ObiettivoGestionale) !== norm(selectedOG))
        return false;
      return true;
    });
  };

  // ================= POPULATE LISTS =================
  useEffect(() => {
    setMissioni([...new Set(data.map((d) => d.Missione))]);
  }, []);

  useEffect(() => {
    if (selectedMissione) {
      const programmiFiltrati = [
        ...new Set(
          data
            .filter((d) => d.Missione === selectedMissione)
            .map((d) => d.Programma)
        ),
      ];
      setProgrammi(programmiFiltrati);
    } else setProgrammi([]);
  }, [selectedMissione]);

  useEffect(() => {
    if (selectedProgramma) {
      const osFiltrati = [
        ...new Set(
          data
            .filter(
              (d) =>
                d.Missione === selectedMissione &&
                d.Programma === selectedProgramma
            )
            .map((d) => d.ObiettivoStrategico)
        ),
      ];
      setOsList(osFiltrati);
    } else setOsList([]);
  }, [selectedProgramma]);

  useEffect(() => {
    if (selectedOS) {
      const odFiltrati = [
        ...new Set(
          data
            .filter((d) => d.ObiettivoStrategico === selectedOS)
            .map((d) => d.ObiettivoDirezionale)
        ),
      ];
      setOdList(odFiltrati);
    } else setOdList([]);
  }, [selectedOS]);

  useEffect(() => {
  if (selectedOD) {
    const ogFiltrati = [
      ...new Set(
        data
          .filter(
            (d) =>
              norm(d.ObiettivoDirezionale) === norm(selectedOD) &&
              d.ObiettivoGestionale
          )
          .map((d) => d.ObiettivoGestionale.trim())
      ),
    ];
    setOgList(ogFiltrati);
  } else {
    setOgList([]);
  }
}, [selectedOD]);


  // ================= UPDATE CDR =================
  useEffect(() => {
    const matches = findMatchingRows();
    if (matches.length > 0) {
      const cdrUnici = [
        ...new Map(
          matches.map((m) => [
            m.CdR || m["CDR (nuovi)"],
            {
              nome: m.CdR || m["CDR (nuovi)"],
              codice: m.CodiceCdR || m["Codice CdR"],
              sap: m.CodiceSAP || m["Codice SAP"],
            },
          ])
        ).values(),
      ];
      setCdrList(cdrUnici);

      if (cdrUnici.length === 1) {
        setSelectedCdr(cdrUnici[0].nome);
        setCdrCompetente(cdrUnici[0].nome);
        setCodiceCdR(cdrUnici[0].codice);
        setCodiceSAP(cdrUnici[0].sap);
      }
    } else {
      setCdrList([]);
      setSelectedCdr("");
      setCdrCompetente("");
      setCodiceCdR("");
      setCodiceSAP("");
    }
  }, [selectedMissione, selectedProgramma, selectedOS, selectedOD, selectedOG]);

  // ================= ADD / DELETE =================
  const handleAddRiga = () => {
    if (!selectedMissione || !selectedProgramma || !selectedOG) {
      alert("⚠️ Compila almeno Missione, Programma e Obiettivo Gestionale");
      return;
    }

    const nuovaRiga = {
      Missione: selectedMissione,
      Programma: selectedProgramma,
      TipoDocumento: tipoDocumento === "Altro" ? altroTipo : tipoDocumento,
      DataDocumento: dataDocumento,
      DescrizioneDocumento: descrizioneDocumento,
      ObiettivoStrategico: selectedOS,
      ObiettivoDirezionale: selectedOD,
      ObiettivoGestionale: selectedOG,
      CdRCompetente: cdrCompetente,
      CodiceCdR: codiceCdR,
      CodiceSAP: codiceSAP,
    };

    setRighe((prev) => [...prev, nuovaRiga]);
  };

  const handleDeleteRiga = (i) =>
    setRighe((prev) => prev.filter((_, index) => index !== i));

  // ================= EXPORT =================
  const exportToExcel = () => {
    if (!righe.length) return alert("Nessun dato da esportare");
    const ws = XLSX.utils.json_to_sheet(righe);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pianificazione");
    XLSX.writeFile(wb, "riepilogo_pianificazione.xlsx");
  };

  const exportToPDF = () => {
    if (!righe.length) return alert("Nessun dato da esportare");
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Riepilogo Pianificazione", 14, 15);
    doc.autoTable({
      head: [
        [
          "Missione",
          "Programma",
          "Tipo Documento",
          "Data",
          "Ob. Gestionale",
          "CdR",
          "Codice CdR",
          "Codice SAP",
        ],
      ],
      body: righe.map((r) => [
        r.Missione,
        r.Programma,
        r.TipoDocumento,
        r.DataDocumento,
        r.ObiettivoGestionale,
        r.CdRCompetente,
        r.CodiceCdR,
        r.CodiceSAP,
      ]),
      startY: 25,
    });
    doc.save("riepilogo_pianificazione.pdf");
  };

  // ================= RENDER =================
  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 text-success fw-bold">
        🌲 Programmazione Forestale
      </h1>

      {/* ================= Missione ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="text-success mb-4">1️⃣ Missione e Programma</h4>
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label">Missione</label>
              <select
                className="form-select"
                value={selectedMissione}
                onChange={(e) => setSelectedMissione(e.target.value.trim())}
              >
                <option value="">Seleziona Missione</option>
                {missioni.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Programma</label>
              <select
                className="form-select"
                value={selectedProgramma}
                onChange={(e) => setSelectedProgramma(e.target.value.trim())}

              >
                <option value="">Seleziona Programma</option>
                {programmi.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Documento ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="text-warning mb-4">2️⃣ Documento di Programmazione</h4>
          <div className="row g-4">
            <div className="col-md-4">
              <label className="form-label">Tipo Documento</label>
              <select
                className="form-select"
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
              >
                <option value="">Seleziona Tipo</option>
                <option value="Deliberazione Commissariale">
                  Deliberazione Commissariale
                </option>
                <option value="Legge Regionale">Legge Regionale</option>
                <option value="Altro">Altro</option>
              </select>
              {tipoDocumento === "Altro" && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Specifica tipo documento"
                  value={altroTipo}
                  onChange={(e) => setAltroTipo(e.target.value)}
                />
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">Data e riferimento</label>
              <input
                type="text"
                className="form-control"
                placeholder="es. n. 42 del 31/08/2023"
                value={dataDocumento}
                onChange={(e) => setDataDocumento(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Descrizione</label>
              <textarea
                className="form-control"
                rows={2}
                value={descrizioneDocumento}
                onChange={(e) => setDescrizioneDocumento(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= Obiettivi ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="text-primary mb-4">3️⃣ Obiettivi</h4>
          <div className="row g-4">
            <div className="col-md-4">
              <label className="form-label">Obiettivo Strategico</label>
              <select
                className="form-select"
                value={selectedOS}
                onChange={(e) => setSelectedOS(e.target.value.trim())}
              >
                <option value="">Seleziona</option>
                {osList.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Obiettivo Direzionale</label>
              <select
                className="form-select"
                 value={selectedOD}
                    onChange={(e) => {
                      setSelectedOD(e.target.value.trim());
                      setSelectedOG("");
                    }}              >
                <option value="">Seleziona</option>
                {odList.map((od) => (
                  <option key={od} value={od}>
                    {od}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Obiettivo Gestionale</label>
              <select
                className="form-select"
                value={selectedOG}
                onChange={(e) => setSelectedOG(e.target.value.trim())}
              >
                <option value="">Seleziona</option>
                {ogList.map((og) => (
                 <option key={og} value={og.trim()}>
                    {og}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CdR ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="text-secondary mb-4">4️⃣ CdR e Codici</h4>
          <div className="row g-4">
            <div className="col-md-4">
              <label className="form-label">CdR Competente</label>
              {cdrList.length > 1 ? (
                <select
                  className="form-select"
                  value={selectedCdr}
                  onChange={(e) => {
                    const scelto = cdrList.find(
                      (c) => c.nome === e.target.value
                    );
                    setSelectedCdr(e.target.value);
                    setCdrCompetente(scelto?.nome || "");
                    setCodiceCdR(scelto?.codice || "");
                    setCodiceSAP(scelto?.sap || "");
                  }}
                >
                  <option value="">Seleziona CdR</option>
                  {cdrList.map((c) => (
                    <option key={c.codice} value={c.nome}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  value={cdrCompetente}
                  readOnly
                />
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">Codice CdR</label>
              <input
                type="text"
                className="form-control"
                value={codiceCdR}
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Codice SAP</label>
              <input
                type="text"
                className="form-control"
                value={codiceSAP}
                 onChange={(e) => setCodiceSAP(e.target.value)}
                placeholder="Inserisci codice SAP"
                
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div className="text-center mb-5">
        <button className="btn btn-success btn-lg" onClick={handleAddRiga}>
          ➕ Aggiungi Obiettivo
        </button>
      </div>

      {/* ================= TABLE ================= */}
      {righe.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="text-center mb-4">🧾 Riepilogo Obiettivi</h4>
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Missione</th>
                    <th>Programma</th>
                    <th>Documento</th>
                    <th>Data</th>
                    <th>Ob. Gestionale</th>
                    <th>CdR</th>
                    <th>Codice CdR</th>
                    <th>Codice SAP</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {righe.map((r, i) => (
                    <tr key={i}>
                      <td>{r.Missione}</td>
                      <td>{r.Programma}</td>
                      <td>{r.TipoDocumento}</td>
                      <td>{r.DataDocumento}</td>
                      <td>{r.ObiettivoGestionale}</td>
                      <td>{r.CdRCompetente}</td>
                      <td>{r.CodiceCdR}</td>
                      <td>{r.CodiceSAP}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteRiga(i)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXPORT ================= */}
      <div className="text-center">
        <button className="btn btn-success me-3" onClick={exportToExcel}>
          📤 Esporta Excel
        </button>
        <button className="btn btn-primary" onClick={exportToPDF}>
          📄 Esporta PDF
        </button>
      </div>
    </div>
  );
};

export default Pianificazione;
