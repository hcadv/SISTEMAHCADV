import { auth } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {title && (
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <h1 className="text-xl font-semibold" style={{ color: "#1e3a5f" }}>
              {title}
            </h1>
          </header>
        )}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
