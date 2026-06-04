export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const casoId = searchParams.get("casoId") || "";

  const acordos = await prisma.acordo.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        casoId ? { casoId } : {},
      ],
    },
    include: { caso: { include: { cliente: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(acordos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const acordo = await prisma.acordo.create({
    data: {
      casoId: data.casoId,
      tipo: data.tipo,
      valor: data.valor ? parseFloat(data.valor) : null,
      descricao: data.descricao || null,
      status: data.status || "PENDENTE",
      dataEnvio: data.dataEnvio ? new Date(data.dataEnvio) : null,
      dataResposta: data.dataResposta ? new Date(data.dataResposta) : null,
      observacoes: data.observacoes || null,
    },
    include: { caso: { include: { cliente: true } } },
  });

  return NextResponse.json(acordo, { status: 201 });
}
