"use client";

import { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";

interface Caso {
  id: string;
  titulo: string;
  cliente: { nome: string };
}

export default function DocumentosClient() {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [selectedCasoId, setSelectedCasoId] = useState("");
  const [tipo, setTipo] = useState("PROCURACAO");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ nome: string; conteudo: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/casos").then((r) => r.json()).then(setCasos);
  }, []);

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCasoId) return;
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/documentos/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ casoId: selectedCasoId, tipo }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setResult({ nome: data.documento.nome, conteudo: data.conteudo });
    } else {
      setError(data.error || "Erro ao gerar documento.");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.nome}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1e3a5f15" }}>
            <FileText size={20} style={{ color: "#1e3a5f" }} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Gerar Documento</h2>
            <p className="text-sm text-gray-500">Selecione o caso e o tipo de documento</p>
          </div>
        </div>

        <form onSubmit={handleGerar} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caso *</label>
            <select required value={selectedCasoId} onChange={(e) => setSelectedCasoId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
              <option value="">Selecione o caso...</option>
              {casos.map((c) => (
                <option key={c.id} value={c.id}>{c.titulo} — {c.cliente.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "PROCURACAO", label: "Procuração Ad Judicia", desc: "Outorga de poderes para representação em juízo" },
                { key: "CONTRATO_HONORARIOS", label: "Contrato de Honorários", desc: "Contrato de prestação de serviços advocatícios" },
              ].map((t) => (
                <button key={t.key} type="button" onClick={() => setTipo(t.key)}
                  className="p-4 rounded-xl border-2 text-left transition-all"
                  style={tipo === t.key ? { borderColor: "#1e3a5f", backgroundColor: "#1e3a5f" } : { borderColor: "#e5e7eb" }}>
                  <p className={`text-sm font-semibold ${tipo === t.key ? "text-white" : "text-gray-900"}`}>{t.label}</p>
                  <p className={`text-xs mt-1 ${tipo === t.key ? "text-blue-200" : "text-gray-500"}`}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading || !selectedCasoId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "#c9a84c" }}>
              <FileText size={16} />
              {loading ? "Gerando..." : "Gerar Documento"}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{result.nome}</h3>
            <button onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: "#1e3a5f" }}>
              <Download size={16} />
              Baixar
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono leading-relaxed">
              {result.conteudo}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>HENRIQUE CHAHINE ADVOGADOS</strong> — CNPJ: 58.044.571/0001-08<br />
          Rua Cel Irineu de Castro, 43 - Jardim Anália Franco, CEP: 03333-050, São Paulo/SP<br />
          OAB/SP 481.888 · Advocacia Trabalhista
        </p>
      </div>
    </div>
  );
}
