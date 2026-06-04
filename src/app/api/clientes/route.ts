import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

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

  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const cliente = await prisma.cliente.create({
    data: {
      nome: data.nome,
      cpf: data.cpf,
      rg: data.rg || null,
      email: data.email || null,
      telefone: data.telefone || null,
      whatsapp: data.whatsapp || null,
      endereco: data.endereco || null,
      profissao: data.profissao || null,
      estadoCivil: data.estadoCivil || null,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      observacoes: data.observacoes || null,
    },
  });

  return NextResponse.json(cliente, { status: 201 });
}
