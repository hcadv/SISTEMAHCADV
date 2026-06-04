"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, isOverdue, isDueSoon } from "@/lib/utils";
import { Save } from "lucide-react";

type PJ = {
  id: string;
  status: string;
  dataEntrevista: Date | null;
  dataLimiteEntrevista: Date | null;
  dataLimiteDocs: Date | null;
  dataLimiteInicial: Date | null;
  observacoesEntrevista: string | null;
  docsRecebidos: string[];
  observacoes: string | null;
};

const steps = [
  { key: "AGUARDANDO_ENTREVISTA", label: "Aguardando Entrevista" },
  { key: "ENTREVISTA_REALIZADA", label: "Entrevista Realizada" },
  { key: "DOCS_PENDENTES", label: "Docs. Pendentes" },
  { key: "DOCS_COMPLETOS", label: "Docs. Completos" },
  { key: "INICIAL_EM_ELABORACAO", label: "Inicial em Elaboração" },
  { key: "INICIAL_ENTREGUE", label: "Inicial Entregue" },
];

function deadlineClass(date: Date | null | undefined, passed: boolean) {
  if (passed) return "text-green-700 bg-green-50 border-green-200";
  if (!date) return "text-gray-500 bg-gray-50 border-gray-200";
  if (isOverdue(date)) return "text-red-700 bg-red-50 border-red-200";
  if (isDueSoon(date, 5)) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  return "text-gray-700 bg-gray-50 border-gray-200";
}

export default function PreJudicialForm({ pj }: { pj: PJ }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    status: pj.status,
    dataEntrevista: pj.dataEntrevista ? new Date(pj.dataEntrevista).toISOString().split("T")[0] : "",
    dataLimiteEntrevista: pj.dataLimiteEntrevista ? new Date(pj.dataLimiteEntrevista).toISOString().split("T")[0] : "",
    dataLimiteDocs: pj.dataLimiteDocs ? new Date(pj.dataLimiteDocs).toISOString().split("T")[0] : "",
    dataLimiteInicial: pj.dataLimiteInicial ? new Date(pj.dataLimiteInicial).toISOString().split("T")[0] : "",
    observacoesEntrevista: pj.observacoesEntrevista || "",
    docsRecebidos: pj.docsRecebidos.join(", "),
    observacoes: pj.observacoes || "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const currentIdx = steps.findIndex((s) => s.key === form.status);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    await fetch(`/api/pre-judicial/${pj.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        docsRecebidos: form.docsRecebidos.split(",").map((d) => d.trim()).filter(Boolean),
      }),
    });
    setLoading(false);
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  // Deadline cards
  const deadlines = [
    {
      label: "Prazo para Entrevista",
      dateStr: form.dataLimiteEntrevista,
      date: pj.dataLimiteEntrevista,
      passed: currentIdx > 0,
      realDate: form.dataEntrevista ? `Realizada: ${formatDate(new Date(form.dataEntrevista))}` : null,
    },
    {
      label: "Prazo para Documentação",
      dateStr: form.dataLimiteDocs,
      date: pj.dataLimiteDocs,
      passed: currentIdx >= 3,
    },
    {
      label: "Prazo para Petição Inicial",
      dateStr: form.dataLimiteInicial,
      date: pj.dataLimiteInicial,
      passed: currentIdx >= 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Etapas do Processo</h3>
        <div className="space-y-3">
          {steps.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} className={`flex items-center gap-3 p-3 rounded-lg border ${
                done ? "border-green-200 bg-green-50" :
                active ? "border-current bg-amber-50" : "border-gray-100 bg-gray-50"
              }`} style={active ? { borderColor: "#c9a84c" } : {}}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  done ? "bg-green-500 text-white" : active ? "text-white" : "bg-gray-200 text-gray-500"
                }`} style={active ? { backgroundColor: "#c9a84c" } : {}}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium ${
                  done ? "text-green-700" : active ? "text-amber-800" : "text-gray-500"
                }`}>
                  {s.label}
                </span>
                {active && <span className="ml-auto text-xs font-semibold" style={{ color: "#c9a84c" }}>ATUAL</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deadlines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {deadlines.map((d) => (
          <div key={d.label} className={`p-4 rounded-xl border ${deadlineClass(d.date, d.passed)}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1">{d.label}</p>
            <p className="text-lg font-bold">{d.dateStr ? formatDate(new Date(d.dateStr)) : "Não definido"}</p>
            {d.passed && <p className="text-xs mt-1">✓ Etapa concluída</p>}
            {!d.passed && d.date && isOverdue(d.date) && <p className="text-xs mt-1">⚠ Prazo vencido</p>}
            {!d.passed && d.date && isDueSoon(d.date, 5) && !isOverdue(d.date) && <p className="text-xs mt-1">⚡ Prazo próximo</p>}
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Atualizar Informações</h3>

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Salvo com sucesso!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
              {steps.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Entrevista</label>
            <input type="date" value={form.dataEntrevista} onChange={(e) => set("dataEntrevista", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo para Entrevista</label>
            <input type="date" value={form.dataLimiteEntrevista} onChange={(e) => set("dataLimiteEntrevista", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo para Documentação</label>
            <input type="date" value={form.dataLimiteDocs} onChange={(e) => set("dataLimiteDocs", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo para Petição Inicial</label>
            <input type="date" value={form.dataLimiteInicial} onChange={(e) => set("dataLimiteInicial", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Documentos Recebidos (separados por vírgula)</label>
            <input value={form.docsRecebidos} onChange={(e) => set("docsRecebidos", e.target.value)} placeholder="CTPS, Contracheques, Cartão Ponto..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          {form.docsRecebidos && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Documentos listados:</p>
              <div className="flex flex-wrap gap-1.5">
                {form.docsRecebidos.split(",").map((d) => d.trim()).filter(Boolean).map((d) => (
                  <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">{d}</span>
                ))}
              </div>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações da Entrevista</label>
            <textarea rows={3} value={form.observacoesEntrevista} onChange={(e) => set("observacoesEntrevista", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
            <textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50" style={{ backgroundColor: "#1e3a5f" }}>
            <Save size={16} />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
