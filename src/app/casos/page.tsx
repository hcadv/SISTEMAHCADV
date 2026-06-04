import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { formatDate, formatCurrency, statusCasoColor, statusCasoLabel } from "@/lib/utils";
import { Plus, Briefcase } from "lucide-react";
import CasosSearch from "./CasosSearch";

const tabs = [
  { key: "", label: "Todos" },
  { key: "NOVO", label: "Novo" },
  { key: "PRE_JUDICIAL", label: "Pré-Judicial" },
  { key: "ATIVO", label: "Ativo" },
  { key: "ACORDO", label: "Acordo" },
  { key: "ENCERRADO", label: "Encerrado" },
];

interface Props {
  searchParams: { q?: string; status?: string };
}

export default async function CasosPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const q = searchParams.q || "";
  const status = searchParams.status || "";

  const casos = await prisma.caso.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        q
          ? {
              OR: [
                { titulo: { contains: q, mode: "insensitive" } },
                { numero: { contains: q } },
                { reclamada: { contains: q, mode: "insensitive" } },
                { cliente: { nome: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: { cliente: true, preJudicial: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout title="Casos">
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CasosSearch defaultQ={q} defaultStatus={status} />
          <Link
            href="/casos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium whitespace-nowrap"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <Plus size={16} />
            Novo Caso
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/casos?status=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                status === tab.key
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {casos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Briefcase size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Nenhum caso encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Reclamada</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Valor</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Data</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {casos.map((caso) => (
                  <tr key={caso.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/casos/${caso.id}`} className="font-medium text-sm hover:underline" style={{ color: "#1e3a5f" }}>
                        {caso.titulo}
                      </Link>
                      {caso.numero && (
                        <p className="text-xs text-gray-400 mt-0.5">{caso.numero}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      <Link href={`/clientes/${caso.clienteId}`} className="hover:underline">
                        {caso.cliente.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{caso.reclamada || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{caso.valor ? formatCurrency(caso.valor) : "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{formatDate(caso.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusCasoColor(caso.status)}`}>
                        {statusCasoLabel(caso.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-sm text-gray-400">{casos.length} caso(s) encontrado(s)</p>
      </div>
    </DashboardLayout>
  );
}
