import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DocumentosClient from "./DocumentosClient";

export default async function DocumentosPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardLayout title="Documentos">
      <DocumentosClient />
    </DashboardLayout>
  );
}
