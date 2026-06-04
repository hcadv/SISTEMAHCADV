import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  const casos = await prisma.caso.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        q
          ? {
              OR: [
                { titulo: { contains: q, mode: "insensitive" } },
                { numero: { contains: q } },
                { reclamada: { contains: q, mode: "insensitive" } },
                { cliente: { nome: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: {
      cliente: true,
      preJudicial: true,
      _count: { select: { acordos: true, documentos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(casos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const caso = await prisma.caso.create({
    data: {
      numero: data.numero || null,
      titulo: data.titulo,
      descricao: data.descricao || null,
      status: data.status || "NOVO",
      vara: data.vara || null,
      reclamada: data.reclamada || null,
      valor: data.valor ? parseFloat(data.valor) : null,
      dataDistribuicao: data.dataDistribuicao ? new Date(data.dataDistribuicao) : null,
      clienteId: data.clienteId,
    },
    include: { cliente: true },
  });

  // If status is PRE_JUDICIAL, auto-create pre-judicial record
  if (data.status === "PRE_JUDICIAL") {
    await prisma.preJudicial.create({
      data: { casoId: caso.id, status: "AGUARDANDO_ENTREVISTA" },
    });
  }

  return NextResponse.json(caso, { status: 201 });
}
