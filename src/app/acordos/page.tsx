export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { formatDate, formatCurrency, statusAcordoColor, statusAcordoLabel, tipoAcordoLabel } from "@/lib/utils";
import { Handshake } from "lucide-react";

interface Props {
  searchParams: { status?: string };
}

const statusTabs = [
  { key: "", label: "Todos" },
  { key: "PENDENTE", label: "Pendente" },
  { key: "ACEITO", label: "Aceito" },
  { key: "RECUSADO", label: "Recusado" },
  { key: "EXPIRADO", label: "Expirado" },
];

export default async function AcordosPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const status = searchParams.status || "";

  const acordos = await prisma.acordo.findMany({
    where: status ? { status: status as never } : undefined,
    include: { caso: { include: { cliente: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout title="Acordos">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
          {statusTabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/acordos${tab.key ? `?status=${tab.key}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                status === tab.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {acordos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Handshake size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Nenhuma proposta de acordo encontrada</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Caso / Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Valor</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Data Envio</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {acordos.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/casos/${a.casoId}?tab=acordos`} className="font-medium text-sm hover:underline" style={{ color: "#1e3a5f" }}>
                        {a.caso.titulo}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{a.caso.cliente.nome}</p>
                      {a.descricao && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{a.descricao}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{tipoAcordoLabel(a.tipo)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium hidden md:table-cell">
                      {a.valor ? formatCurrency(a.valor) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(a.dataEnvio)}
                    </td>
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
        <p className="text-sm text-gray-400">{acordos.length} proposta(s) encontrada(s)</p>
      </div>
    </DashboardLayout>
  );
}
