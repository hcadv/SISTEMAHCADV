import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PreJudicialForm from "./PreJudicialForm";

export default async function PreJudicialDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const pj = await prisma.preJudicial.findUnique({
    where: { id: params.id },
    include: { caso: { include: { cliente: true } } },
  });

  if (!pj) notFound();

  return (
    <DashboardLayout title="Pré-Judicial">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/pre-judicial" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#1e3a5f" }}>{pj.caso.titulo}</h2>
            <p className="text-sm text-gray-500">{pj.caso.cliente.nome}</p>
          </div>
        </div>
        <PreJudicialForm pj={pj} />
      </div>
    </DashboardLayout>
  );
}
