export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import { formatDate, formatCurrency, statusCasoColor, statusCasoLabel } from "@/lib/utils";
import Link from "next/link";
import { Users, Briefcase, Scale, Handshake, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [totalClientes, totalCasos, casosAtivos, preJudiciaisPendentes, acordosPendentes, recentCases] =
    await Promise.all([
      prisma.cliente.count(),
      prisma.caso.count(),
      prisma.caso.count({ where: { status: "ATIVO" } }),
      prisma.preJudicial.count({
        where: {
          status: { notIn: ["INICIAL_ENTREGUE"] },
        },
      }),
      prisma.acordo.count({ where: { status: "PENDENTE" } }),
      prisma.caso.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { cliente: true },
      }),
    ]);

  const stats = [
    {
      label: "Total de Clientes",
      value: totalClientes,
      icon: Users,
      color: "#1e3a5f",
      href: "/clientes",
    },
    {
      label: "Total de Casos",
      value: totalCasos,
      icon: Briefcase,
      color: "#1e3a5f",
      href: "/casos",
    },
    {
      label: "Pré-Judicial Ativos",
      value: preJudiciaisPendentes,
      icon: Scale,
      color: "#c9a84c",
      href: "/pre-judicial",
    },
    {
      label: "Acordos Pendentes",
      value: acordosPendentes,
      icon: Handshake,
      color: "#c9a84c",
      href: "/acordos",
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.color + "15" }}
                >
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                Ver detalhes <ArrowRight size={12} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Casos Ativos badge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{casosAtivos}</span> casos ativos no momento
          </span>
        </div>

        {/* Recent cases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Casos Recentes</h2>
            <Link href="/casos" className="text-sm font-medium" style={{ color: "#1e3a5f" }}>
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentCases.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                Nenhum caso cadastrado ainda.
              </div>
            ) : (
              recentCases.map((caso) => (
                <Link
                  key={caso.id}
                  href={`/casos/${caso.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {caso.titulo}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {caso.cliente.nome} · {caso.numero || "Sem número"} · {formatDate(caso.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    {caso.valor && (
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(caso.valor)}
                      </span>
                    )}
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusCasoColor(caso.status)}`}
                    >
                      {statusCasoLabel(caso.status)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
