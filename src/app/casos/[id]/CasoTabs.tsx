"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  formatDate,
  formatCurrency,
  formatCPF,
  statusCasoColor,
  statusCasoLabel,
  statusPreJudicialLabel,
  statusAcordoColor,
  statusAcordoLabel,
  tipoAcordoLabel,
} from "@/lib/utils";
import { Save, Plus, FileText, Download } from "lucide-react";

type Caso = {
  id: string;
  numero: string | null;
  titulo: string;
  descricao: string | null;
  status: string;
  vara: string | null;
  reclamada: string | null;
  valor: number | null;
  dataDistribuicao: Date | null;
  clienteId: string;
  cliente: { id: string; nome: string; cpf: string; email: string | null; telefone: string | null };
  preJudicial: {
    id: string;
    status: string;
    dataEntrevista: Date | null;
    dataLimiteEntrevista: Date | null;
    dataLimiteDocs: Date | null;
    dataLimiteInicial: Date | null;
    observacoesEntrevista: string | null;
    docsRecebidos: string[];
    observacoes: string | null;
  } | null;
  acordos: {
    id: string;
    tipo: string;
    valor: number | null;
    descricao: string | null;
    status: string;
    dataEnvio: Date | null;
    dataResposta: Date | null;
    observacoes: string | null;
    createdAt: Date;
  }[];
  documentos: {
    id: string;
    tipo: string;
    nome: string;
    conteudo: string;
    createdAt: Date;
  }[];
};

const TABS = [
  { key: "detalhes", label: "Detalhes" },
  { key: "pre-judicial", label: "Pré-Judicial" },
  { key: "acordos", label: "Acordos" },
  { key: "documentos", label: "Documentos" },
];

export default function CasoTabs({ caso, activeTab }: { caso: Caso; activeTab: string }) {
  const [tab, setTab] = useState(activeTab);
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{caso.titulo}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCasoColor(caso.status)}`}>
                {statusCasoLabel(caso.status)}
              </span>
              {caso.numero && (
                <span className="text-sm text-gray-500">Processo: {caso.numero}</span>
              )}
              <Link href={`/clientes/${caso.clienteId}`} className="text-sm hover:underline" style={{ color: "#1e3a5f" }}>
                {caso.cliente.nome}
              </Link>
            </div>
          </div>
          {caso.valor && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Valor estimado</p>
              <p className="text-lg font-bold" style={{ color: "#1e3a5f" }}>{formatCurrency(caso.valor)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.key === "acordos" && caso.acordos.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-200 rounded-full text-xs">{caso.acordos.length}</span>
            )}
            {t.key === "documentos" && caso.documentos.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-200 rounded-full text-xs">{caso.documentos.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "detalhes" && <DetalhesTab caso={caso} onSaved={() => router.refresh()} />}
      {tab === "pre-judicial" && <PreJudicialTab caso={caso} onSaved={() => router.refresh()} />}
      {tab === "acordos" && <AcordosTab caso={caso} onSaved={() => router.refresh()} />}
      {tab === "documentos" && <DocumentosTab caso={caso} onSaved={() => router.refresh()} />}
    </div>
  );
}

function DetalhesTab({ caso, onSaved }: { caso: Caso; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: caso.titulo,
    numero: caso.numero || "",
    descricao: caso.descricao || "",
    status: caso.status,
    vara: caso.vara || "",
    reclamada: caso.reclamada || "",
    valor: caso.valor?.toString() || "",
    dataDistribuicao: caso.dataDistribuicao ? new Date(caso.dataDistribuicao).toISOString().split("T")[0] : "",
    clienteId: caso.clienteId,
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    await fetch(`/api/casos/${caso.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setEditing(false);
    onSaved();
  };

  if (!editing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setEditing(true)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Editar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Status" value={statusCasoLabel(caso.status)} />
          <Field label="Número do Processo" value={caso.numero || "—"} />
          <Field label="Reclamada" value={caso.reclamada || "—"} />
          <Field label="Vara" value={caso.vara || "—"} />
          <Field label="Valor Estimado" value={caso.valor ? formatCurrency(caso.valor) : "—"} />
          <Field label="Data de Distribuição" value={formatDate(caso.dataDistribuicao)} />
          <div className="sm:col-span-2">
            <Field label="Descrição" value={caso.descricao || "—"} />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Cliente: <Link href={`/clientes/${caso.clienteId}`} className="font-medium hover:underline" style={{ color: "#1e3a5f" }}>{caso.cliente.nome}</Link>
            {" · "}CPF: {formatCPF(caso.cliente.cpf)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
            <option value="NOVO">Novo</option>
            <option value="PRE_JUDICIAL">Pré-Judicial</option>
            <option value="ATIVO">Ativo</option>
            <option value="ACORDO">Acordo</option>
            <option value="ENCERRADO">Encerrado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número do processo</label>
          <input value={form.numero} onChange={(e) => set("numero", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reclamada</label>
          <input value={form.reclamada} onChange={(e) => set("reclamada", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vara</label>
          <input value={form.vara} onChange={(e) => set("vara", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
          <input type="number" step="0.01" value={form.valor} onChange={(e) => set("valor", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de distribuição</label>
          <input type="date" value={form.dataDistribuicao} onChange={(e) => set("dataDistribuicao", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea rows={4} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50" style={{ backgroundColor: "#1e3a5f" }}>
          <Save size={16} />
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function PreJudicialTab({ caso, onSaved }: { caso: Caso; onSaved: () => void }) {
  const pj = caso.preJudicial;
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    status: pj?.status || "AGUARDANDO_ENTREVISTA",
    dataEntrevista: pj?.dataEntrevista ? new Date(pj.dataEntrevista).toISOString().split("T")[0] : "",
    dataLimiteEntrevista: pj?.dataLimiteEntrevista ? new Date(pj.dataLimiteEntrevista).toISOString().split("T")[0] : "",
    dataLimiteDocs: pj?.dataLimiteDocs ? new Date(pj.dataLimiteDocs).toISOString().split("T")[0] : "",
    dataLimiteInicial: pj?.dataLimiteInicial ? new Date(pj.dataLimiteInicial).toISOString().split("T")[0] : "",
    observacoesEntrevista: pj?.observacoesEntrevista || "",
    docsRecebidos: (pj?.docsRecebidos || []).join(", "),
    observacoes: pj?.observacoes || "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreatePJ = async () => {
    setCreating(true);
    await fetch(`/api/casos/${caso.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...caso, status: "PRE_JUDICIAL", valor: caso.valor?.toString(), dataDistribuicao: caso.dataDistribuicao ? new Date(caso.dataDistribuicao).toISOString().split("T")[0] : "" }),
    });
    setCreating(false);
    onSaved();
  };

  const handleSave = async () => {
    if (!pj) return;
    setLoading(true);
    await fetch(`/api/pre-judicial/${pj.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        docsRecebidos: form.docsRecebidos.split(",").map((d) => d.trim()).filter(Boolean),
      }),
    });
    setLoading(false);
    onSaved();
  };

  const steps = [
    { key: "AGUARDANDO_ENTREVISTA", label: "Entrevista" },
    { key: "ENTREVISTA_REALIZADA", label: "Entrevista Realizada" },
    { key: "DOCS_PENDENTES", label: "Docs. Pendentes" },
    { key: "DOCS_COMPLETOS", label: "Docs. Completos" },
    { key: "INICIAL_EM_ELABORACAO", label: "Inicial em Elaboração" },
    { key: "INICIAL_ENTREGUE", label: "Inicial Entregue" },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === (pj?.status || form.status));

  if (!pj) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4">
        <p className="text-gray-500 text-sm">Este caso não possui fase pré-judicial iniciada.</p>
        <button
          onClick={handleCreatePJ}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          <Plus size={16} />
          {creating ? "Criando..." : "Iniciar Fase Pré-Judicial"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Progresso</h3>
        <div className="flex items-center gap-0">
          {steps.map((s, i) => {
            const done = i < currentStepIdx;
            const active = i === currentStepIdx;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      done ? "bg-green-500 border-green-500 text-white" :
                      active ? "border-current text-current" : "border-gray-300 text-gray-300"
                    }`}
                    style={active ? { borderColor: "#c9a84c", color: "#c9a84c" } : {}}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs mt-1 text-center max-w-16 leading-tight ${done ? "text-green-600" : active ? "font-semibold" : "text-gray-400"}`} style={active ? { color: "#c9a84c" } : {}}>
                    {s.label}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Atualizar Informações</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Entrevista</label>
            <input type="date" value={form.dataLimiteEntrevista} onChange={(e) => set("dataLimiteEntrevista", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Documentação</label>
            <input type="date" value={form.dataLimiteDocs} onChange={(e) => set("dataLimiteDocs", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Petição Inicial</label>
            <input type="date" value={form.dataLimiteInicial} onChange={(e) => set("dataLimiteInicial", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Documentos Recebidos (separados por vírgula)</label>
            <input value={form.docsRecebidos} onChange={(e) => set("docsRecebidos", e.target.value)} placeholder="CTPS, Contracheques, Cartão Ponto..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
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
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AcordosTab({ caso, onSaved }: { caso: Caso; onSaved: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipo: "PROPOSTA_ENVIADA",
    valor: "",
    descricao: "",
    status: "PENDENTE",
    dataEnvio: "",
    dataResposta: "",
    observacoes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/acordos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, casoId: caso.id }),
    });
    setLoading(false);
    setShowForm(false);
    setForm({ tipo: "PROPOSTA_ENVIADA", valor: "", descricao: "", status: "PENDENTE", dataEnvio: "", dataResposta: "", observacoes: "" });
    onSaved();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#1e3a5f" }}>
          <Plus size={16} />
          Registrar Proposta
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nova Proposta de Acordo</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
                <option value="PROPOSTA_ENVIADA">Proposta Enviada</option>
                <option value="PROPOSTA_RECEBIDA">Proposta Recebida</option>
                <option value="CONTRAPROPOSTA">Contraproposta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
                <option value="PENDENTE">Pendente</option>
                <option value="ACEITO">Aceito</option>
                <option value="RECUSADO">Recusado</option>
                <option value="EXPIRADO">Expirado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input type="number" step="0.01" value={form.valor} onChange={(e) => set("valor", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data do Envio</label>
              <input type="date" value={form.dataEnvio} onChange={(e) => set("dataEnvio", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Resposta</label>
              <input type="date" value={form.dataResposta} onChange={(e) => set("dataResposta", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea rows={2} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea rows={2} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Cancelar</button>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50" style={{ backgroundColor: "#1e3a5f" }}>
                <Save size={16} />
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {caso.acordos.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Nenhuma proposta de acordo registrada</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Data</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {caso.acordos.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{tipoAcordoLabel(a.tipo)}</p>
                    {a.descricao && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{a.descricao}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.valor ? formatCurrency(a.valor) : "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{formatDate(a.dataEnvio)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusAcordoColor(a.status)}`}>
                      {statusAcordoLabel(a.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DocumentosTab({ caso, onSaved }: { caso: Caso; onSaved: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{ nome: string; conteudo: string } | null>(null);

  const handleGerar = async (tipo: string) => {
    setLoading(tipo);
    const res = await fetch("/api/documentos/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ casoId: caso.id, tipo }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.documento) {
      setGeneratedContent({ nome: data.documento.nome, conteudo: data.conteudo });
      onSaved();
    }
  };

  const handleDownload = (nome: string, conteudo: string) => {
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nome}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Generate buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Gerar Documento</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleGerar("PROCURACAO")}
            disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FileText size={16} />
            {loading === "PROCURACAO" ? "Gerando..." : "Gerar Procuração"}
          </button>
          <button
            onClick={() => handleGerar("CONTRATO_HONORARIOS")}
            disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FileText size={16} />
            {loading === "CONTRATO_HONORARIOS" ? "Gerando..." : "Gerar Contrato de Honorários"}
          </button>
        </div>
      </div>

      {/* Generated content preview */}
      {generatedContent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{generatedContent.nome}</h3>
            <button
              onClick={() => handleDownload(generatedContent.nome, generatedContent.conteudo)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: "#c9a84c" }}
            >
              <Download size={14} />
              Baixar
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg font-mono text-xs leading-relaxed max-h-96 overflow-y-auto border">
            {generatedContent.conteudo}
          </pre>
        </div>
      )}

      {/* Existing documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Documentos Gerados ({caso.documentos.length})</h3>
        </div>
        {caso.documentos.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Nenhum documento gerado ainda</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {caso.documentos.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.nome}</p>
                  <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDownload(doc.nome, doc.conteudo)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
                >
                  <Download size={14} />
                  Baixar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
