export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caso = await prisma.caso.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      preJudicial: true,
      acordos: { orderBy: { createdAt: "desc" } },
      documentos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!caso) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(caso);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const oldCase = await prisma.caso.findUnique({ where: { id: params.id }, include: { preJudicial: true } });

  const caso = await prisma.caso.update({
    where: { id: params.id },
    data: {
      numero: data.numero || null,
      titulo: data.titulo,
      descricao: data.descricao || null,
      status: data.status,
      vara: data.vara || null,
      reclamada: data.reclamada || null,
      valor: data.valor ? parseFloat(data.valor) : null,
      dataDistribuicao: data.dataDistribuicao ? new Date(data.dataDistribuicao) : null,
      clienteId: data.clienteId,
    },
  });

  // Auto-create pre-judicial if status changed to PRE_JUDICIAL and none exists
  if (data.status === "PRE_JUDICIAL" && !oldCase?.preJudicial) {
    await prisma.preJudicial.create({
      data: { casoId: caso.id, status: "AGUARDANDO_ENTREVISTA" },
    });
  }

  return NextResponse.json(caso);
}
