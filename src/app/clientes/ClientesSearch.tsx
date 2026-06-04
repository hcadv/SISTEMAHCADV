"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function ClientesSearch({ defaultValue }: { defaultValue: string }) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q ? `/clientes?q=${encodeURIComponent(q)}` : "/clientes");
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-sm">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome, CPF ou email..."
        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
      />
    </form>
  );
}
