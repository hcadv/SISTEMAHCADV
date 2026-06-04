import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewClientNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.nome || !data.cpf) {
    return NextResponse.json({ error: "Nome e CPF são obrigatórios." }, { status: 400 });
  }

  try {
    const existing = await prisma.cliente.findUnique({ where: { cpf: data.cpf } });
    if (existing) {
      return NextResponse.json({ error: "CPF já cadastrado." }, { status: 409 });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        cpf: data.cpf,
        email: data.email || null,
        telefone: data.telefone || null,
        whatsapp: data.whatsapp || null,
        endereco: data.endereco || null,
        profissao: data.profissao || null,
        estadoCivil: data.estadoCivil || null,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
        observacoes: data.descricaoCaso
          ? `[Formulário público] ${data.descricaoCaso}`
          : null,
      },
    });

    // Send email notification
    await sendNewClientNotification({
      nome: data.nome,
      email: data.email || "",
      telefone: data.telefone || "",
      cpf: data.cpf,
      descricaoCaso: data.descricaoCaso || "",
    });

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Erro ao salvar. Tente novamente." }, { status: 500 });
  }
}
