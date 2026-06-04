export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { formatDate, formatCPF } from "@/lib/utils";
import { UserPlus, Search, Users } from "lucide-react";
import ClientesSearch from "./ClientesSearch";

interface SearchProps {
  searchParams: { q?: string };
}

export default async function ClientesPage({ searchParams }: SearchProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const q = searchParams.q || "";

  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q, mode: "insensitive" } },
            { cpf: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { casos: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <DashboardLayout title="Clientes">
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ClientesSearch defaultValue={q} />
          <Link
            href="/clientes/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <UserPlus size={16} />
            Novo Cliente
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={48} className="mb-3 opacity-30" />
              <p className="text-sm">
                {q ? `Nenhum resultado para "${q}"` : "Nenhum cliente cadastrado"}
              </p>
              {!q && (
                <Link
                  href="/clientes/novo"
                  className="mt-4 text-sm font-medium"
                  style={{ color: "#1e3a5f" }}
                >
                  Cadastrar primeiro cliente
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    CPF
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                    Telefone
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                    Cadastro
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Casos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="font-medium text-sm hover:underline"
                        style={{ color: "#1e3a5f" }}
                      >
                        {cliente.nome}
                      </Link>
                      {cliente.email && (
                        <p className="text-xs text-gray-500 mt-0.5">{cliente.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {formatCPF(cliente.cpf)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {cliente.telefone || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(cliente.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "#1e3a5f" }}>
                        {cliente._count.casos}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-sm text-gray-400">{clientes.length} cliente(s) encontrado(s)</p>
      </div>
    </DashboardLayout>
  );
}
