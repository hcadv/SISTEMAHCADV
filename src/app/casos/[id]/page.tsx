import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CasoTabs from "./CasoTabs";

export default async function CasoDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { tab?: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const caso = await prisma.caso.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      preJudicial: true,
      acordos: { orderBy: { createdAt: "desc" } },
      documentos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!caso) notFound();

  return (
    <DashboardLayout title="Detalhes do Caso">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/casos" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </Link>
        </div>
        <CasoTabs caso={caso} activeTab={searchParams.tab || "detalhes"} />
      </div>
    </DashboardLayout>
  );
}
