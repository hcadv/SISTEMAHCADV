"use client";

import { useState } from "react";
import { Phone, CheckCircle } from "lucide-react";

const estadosCivis = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];

export default function NovoClientePublicPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    whatsapp: "",
    endereco: "",
    profissao: "",
    estadoCivil: "",
    dataNascimento: "",
    descricaoCaso: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/novo-cliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Erro ao enviar. Tente novamente.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#f8f7f4" }}>
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Cadastro realizado!</h1>
            <p className="text-gray-600 text-sm mb-6">
              Seus dados foram enviados com sucesso. Nossa equipe entrará em contato em breve.
            </p>
            <a
              href={`https://wa.me/5511978343681?text=${encodeURIComponent(`Olá! Acabei de preencher o formulário de cadastro no site do HC Advogados. Meu nome é ${form.nome}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Phone size={18} />
              Falar pelo WhatsApp
            </a>
            <p className="text-xs text-gray-400 mt-4">
              (11) 97834-3681
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "#f8f7f4" }}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            HC
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>HC Advogados</h1>
          <p className="text-gray-500 text-sm">HENRIQUE CHAHINE ADVOGADOS · Advocacia Trabalhista</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Formulário de Cadastro</h2>
          <p className="text-sm text-gray-500 mb-6">
            Preencha seus dados e descreva seu caso. Entraremos em contato em breve.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input required value={form.nome} onChange={(e) => set("nome", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                <input required value={form.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(11) 00000-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(11) 00000-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input type="date" value={form.dataNascimento} onChange={(e) => set("dataNascimento", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                <select value={form.estadoCivil} onChange={(e) => set("estadoCivil", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
                  <option value="">Selecione...</option>
                  {estadosCivis.map((ec) => <option key={ec} value={ec}>{ec}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                <input value={form.profissao} onChange={(e) => set("profissao", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do caso / motivo do contato *</label>
                <textarea
                  required
                  rows={5}
                  value={form.descricaoCaso}
                  onChange={(e) => set("descricaoCaso", e.target.value)}
                  placeholder="Descreva brevemente sua situação, o que aconteceu, com qual empresa, há quanto tempo..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 mt-2"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              {loading ? "Enviando..." : "Enviar Cadastro"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Rua Cel Irineu de Castro, 43 - Jardim Anália Franco, São Paulo/SP<br />
              (11) 97834-3681 · contato@hca.adv.br
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
