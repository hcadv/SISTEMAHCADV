import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Suspense } from "react";
import NovoCasoForm from "./NovoCasoForm";

export default async function NovoCasoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardLayout title="Novo Caso">
      <Suspense fallback={<div className="text-sm text-gray-500">Carregando...</div>}>
        <NovoCasoForm />
      </Suspense>
    </DashboardLayout>
  );
}
