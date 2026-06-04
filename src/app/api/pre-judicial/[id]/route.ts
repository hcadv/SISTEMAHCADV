export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pj = await prisma.preJudicial.findUnique({
    where: { id: params.id },
    include: { caso: { include: { cliente: true } } },
  });

  if (!pj) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pj);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const pj = await prisma.preJudicial.update({
    where: { id: params.id },
    data: {
      status: data.status,
      dataEntrevista: data.dataEntrevista ? new Date(data.dataEntrevista) : undefined,
      dataLimiteEntrevista: data.dataLimiteEntrevista ? new Date(data.dataLimiteEntrevista) : undefined,
      dataLimiteDocs: data.dataLimiteDocs ? new Date(data.dataLimiteDocs) : undefined,
      dataLimiteInicial: data.dataLimiteInicial ? new Date(data.dataLimiteInicial) : undefined,
      observacoesEntrevista: data.observacoesEntrevista || null,
      docsRecebidos: data.docsRecebidos || [],
      observacoes: data.observacoes || null,
    },
  });

  return NextResponse.json(pj);
}
