import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { formatDate, formatCPF, formatCurrency, statusCasoColor, statusCasoLabel } from "@/lib/utils";
import { ArrowLeft, Briefcase, Mail, Phone, MapPin, User, Plus } from "lucide-react";

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      casos: {
        include: { preJudicial: true, _count: { select: { acordos: true, documentos: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cliente) notFound();

  return (
    <DashboardLayout title="Detalhes do Cliente">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </Link>
        </div>

        {/* Client card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {cliente.nome.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{cliente.nome}</h2>
                <p className="text-sm text-gray-500">
                  CPF: {formatCPF(cliente.cpf)}
                  {cliente.rg && ` · RG: ${cliente.rg}`}
                </p>
                {cliente.profissao && (
                  <p className="text-sm text-gray-500">{cliente.profissao}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cliente.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                {cliente.email}
              </div>
            )}
            {cliente.telefone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={15} className="text-gray-400 flex-shrink-0" />
                {cliente.telefone}
              </div>
            )}
            {cliente.endereco && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{cliente.endereco}</span>
              </div>
            )}
            {cliente.dataNascimento && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={15} className="text-gray-400 flex-shrink-0" />
                Nasc: {formatDate(cliente.dataNascimento)}
                {cliente.estadoCivil && ` · ${cliente.estadoCivil}`}
              </div>
            )}
          </div>

          {cliente.observacoes && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-800">{cliente.observacoes}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Cadastrado em {formatDate(cliente.createdAt)} · Atualizado em {formatDate(cliente.updatedAt)}
          </p>
        </div>

        {/* Cases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Casos ({cliente.casos.length})
            </h3>
            <Link
              href={`/casos/novo?clienteId=${cliente.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              <Plus size={14} />
              Novo Caso
            </Link>
          </div>

          {cliente.casos.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Briefcase size={36} className="mb-2 opacity-30" />
              <p className="text-sm">Nenhum caso cadastrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {cliente.casos.map((caso) => (
                <Link
                  key={caso.id}
                  href={`/casos/${caso.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{caso.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {caso.numero || "Sem número"} · {caso.reclamada || "—"} · {formatDate(caso.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {caso.valor && (
                      <span className="text-sm text-gray-600 hidden sm:block">{formatCurrency(caso.valor)}</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCasoColor(caso.status)}`}>
                      {statusCasoLabel(caso.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
