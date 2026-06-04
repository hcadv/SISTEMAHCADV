"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
}

export default function NovoCasoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClienteId = searchParams.get("clienteId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState({
    titulo: "", numero: "", descricao: "", status: "NOVO",
    vara: "", reclamada: "", valor: "", dataDistribuicao: "",
    clienteId: preselectedClienteId,
  });

  useEffect(() => {
    fetch("/api/clientes").then((r) => r.json()).then(setClientes);
  }, []);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/casos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/casos/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao salvar. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/casos" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-lg font-semibold" style={{ color: "#1e3a5f" }}>
          Cadastrar Novo Caso
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select required value={form.clienteId} onChange={(e) => set("clienteId", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
              <option value="">Selecione o cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} — {c.cpf}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título do caso *</label>
            <input required value={form.titulo} onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ex: Reclamação Trabalhista - João Santos x Empresa XYZ"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número do processo</label>
            <input value={form.numero} onChange={(e) => set("numero", e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
              <option value="NOVO">Novo</option>
              <option value="PRE_JUDICIAL">Pré-Judicial</option>
              <option value="ATIVO">Ativo</option>
              <option value="ACORDO">Acordo</option>
              <option value="ENCERRADO">Encerrado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reclamada</label>
            <input value={form.reclamada} onChange={(e) => set("reclamada", e.target.value)}
              placeholder="Nome da empresa reclamada"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vara</label>
            <input value={form.vara} onChange={(e) => set("vara", e.target.value)}
              placeholder="Ex: 1ª Vara do Trabalho de São Paulo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor estimado (R$)</label>
            <input type="number" step="0.01" value={form.valor} onChange={(e) => set("valor", e.target.value)}
              placeholder="0,00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de distribuição</label>
            <input type="date" value={form.dataDistribuicao} onChange={(e) => set("dataDistribuicao", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea rows={4} value={form.descricao} onChange={(e) => set("descricao", e.target.value)}
              placeholder="Descreva os fatos e pedidos do caso..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/casos" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: "#1e3a5f" }}>
            <Save size={16} />
            {loading ? "Salvando..." : "Salvar Caso"}
          </button>
        </div>
      </form>
    </div>
  );
}
