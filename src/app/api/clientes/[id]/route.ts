import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      casos: {
        include: { preJudicial: true, _count: { select: { acordos: true, documentos: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cliente) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const cliente = await prisma.cliente.update({
    where: { id: params.id },
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

  return NextResponse.json(cliente);
}
