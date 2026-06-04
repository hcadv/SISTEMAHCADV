import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import NovoClienteForm from "./NovoClienteForm";

export default async function NovoClientePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardLayout title="Novo Cliente">
      <NovoClienteForm />
    </DashboardLayout>
  );
}
