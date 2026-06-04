import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { formatDate, statusPreJudicialLabel, isOverdue, isDueSoon } from "@/lib/utils";
import { Scale } from "lucide-react";

function deadlineColor(date: Date | null | undefined, done: boolean): string {
  if (done) return "text-green-600";
  if (!date) return "text-gray-400";
  if (isOverdue(date)) return "text-red-600 font-semibold";
  if (isDueSoon(date, 5)) return "text-yellow-600 font-semibold";
  return "text-gray-500";
}

function deadlineBadge(date: Date | null | undefined, done: boolean): string {
  if (done) return "bg-green-100 text-green-800";
  if (!date) return "bg-gray-100 text-gray-500";
  if (isOverdue(date)) return "bg-red-100 text-red-800";
  if (isDueSoon(date, 5)) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-600";
}

export default async function PreJudicialPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const preJudiciais = await prisma.preJudicial.findMany({
    include: { caso: { include: { cliente: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <DashboardLayout title="Pré-Judicial">
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Prazo vencido</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>Prazo próximo (5 dias)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>Concluído</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {preJudiciais.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Scale size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Nenhum caso em fase pré-judicial</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Caso / Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Prazo Entrevista</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Prazo Docs</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Prazo Inicial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preJudiciais.map((pj) => {
                  const done = pj.status === "INICIAL_ENTREGUE";
                  return (
                    <tr key={pj.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/casos/${pj.casoId}?tab=pre-judicial`} className="font-medium text-sm hover:underline" style={{ color: "#1e3a5f" }}>
                          {pj.caso.titulo}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{pj.caso.cliente.nome}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${done ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {statusPreJudicialLabel(pj.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className={`text-xs ${deadlineColor(pj.dataLimiteEntrevista, ["ENTREVISTA_REALIZADA","DOCS_PENDENTES","DOCS_COMPLETOS","INICIAL_EM_ELABORACAO","INICIAL_ENTREGUE"].includes(pj.status))}`}>
                          {pj.dataLimiteEntrevista ? formatDate(pj.dataLimiteEntrevista) : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className={`text-xs ${deadlineColor(pj.dataLimiteDocs, ["DOCS_COMPLETOS","INICIAL_EM_ELABORACAO","INICIAL_ENTREGUE"].includes(pj.status))}`}>
                          {pj.dataLimiteDocs ? formatDate(pj.dataLimiteDocs) : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className={`text-xs ${deadlineColor(pj.dataLimiteInicial, ["INICIAL_ENTREGUE"].includes(pj.status))}`}>
                          {pj.dataLimiteInicial ? formatDate(pj.dataLimiteInicial) : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-sm text-gray-400">{preJudiciais.length} caso(s) em fase pré-judicial</p>
      </div>
    </DashboardLayout>
  );
}
