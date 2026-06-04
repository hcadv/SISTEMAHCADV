"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Handshake,
  Scale,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/casos", icon: Briefcase, label: "Casos" },
  { href: "/pre-judicial", icon: Scale, label: "Pré-Judicial" },
  { href: "/acordos", icon: Handshake, label: "Acordos" },
  { href: "/documentos", icon: FileText, label: "Documentos" },
];

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: "#1e3a5f" }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: "#c9a84c" }}
          >
            HC
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              HC Advogados
            </p>
            <p className="text-xs leading-tight" style={{ color: "#c9a84c" }}>
              Advocacia Trabalhista
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
              style={active ? { backgroundColor: "#c9a84c" } : {}}
            >
              <span className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "#c9a84c" }}
          >
            {userName?.charAt(0) || "H"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {userName || "Henrique Chahine"}
            </p>
            <p className="text-blue-300 text-xs truncate">
              {userEmail || "contato@hca.adv.br"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 text-sm transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
