export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { casoId, tipo } = await req.json();

  const caso = await prisma.caso.findUnique({
    where: { id: casoId },
    include: { cliente: true },
  });

  if (!caso) return NextResponse.json({ error: "Caso não encontrado" }, { status: 404 });

  const hoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let conteudo = "";
  let nome = "";

  if (tipo === "PROCURACAO") {
    nome = `Procuração - ${caso.cliente.nome}`;
    conteudo = `PROCURAÇÃO AD JUDICIA

OUTORGANTE: ${caso.cliente.nome}, ${caso.cliente.estadoCivil || "________"}, ${caso.cliente.profissao || "________"}, portador(a) do CPF nº ${caso.cliente.cpf}${caso.cliente.rg ? `, RG nº ${caso.cliente.rg}` : ""}, residente e domiciliado(a) em ${caso.cliente.endereco || "________"}.

OUTORGADO: HENRIQUE CHAHINE, Advogado, inscrito na OAB/SP sob o nº 481.888, com escritório profissional situado na Rua Cel Irineu de Castro, 43 - Jardim Anália Franco, CEP: 03333-050, São Paulo/SP.

PODERES: O OUTORGANTE confere ao OUTORGADO amplos poderes para o foro em geral, nos termos do art. 105 do Código de Processo Civil, podendo propor ações, contestar, recorrer, desistir, transigir, firmar compromissos, dar quitação, receber e dar recibo, substabelecer com ou sem reservas de iguais poderes, e praticar todos os atos necessários ao bom e fiel desempenho do presente mandato, especialmente para patrocinar os interesses do OUTORGANTE nos autos do processo: ${caso.numero || "a ser distribuído"} - ${caso.titulo}.

LOCAL E DATA: São Paulo/SP, ${hoje}.

HENRIQUE CHAHINE ADVOGADOS
CNPJ: 58.044.571/0001-08
Rua Cel Irineu de Castro, 43 - Jardim Anália Franco, CEP: 03333-050, São Paulo/SP
Tel: (11) 97834-3681 | contato@hca.adv.br

_____________________________________________
${caso.cliente.nome}
CPF: ${caso.cliente.cpf}
OUTORGANTE

_____________________________________________
HENRIQUE CHAHINE
OAB/SP 481.888
OUTORGADO`;
  } else if (tipo === "CONTRATO_HONORARIOS") {
    nome = `Contrato de Honorários - ${caso.cliente.nome}`;
    conteudo = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

CONTRATANTE: ${caso.cliente.nome}, ${caso.cliente.estadoCivil || "________"}, ${caso.cliente.profissao || "________"}, portador(a) do CPF nº ${caso.cliente.cpf}${caso.cliente.rg ? `, RG nº ${caso.cliente.rg}` : ""}, residente e domiciliado(a) em ${caso.cliente.endereco || "________"}.

CONTRATADO: HENRIQUE CHAHINE ADVOGADOS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 58.044.571/0001-08, com sede na Rua Cel Irineu de Castro, 43 - Jardim Anália Franco, CEP: 03333-050, São Paulo/SP, representada por HENRIQUE CHAHINE, OAB/SP 481.888, CPF nº 372.323.928-50.

CLÁUSULA 1ª – DO OBJETO
O CONTRATADO compromete-se a prestar serviços advocatícios ao CONTRATANTE, na área da Advocacia Trabalhista, especificamente para patrocinar o seguinte caso:
${caso.titulo}
${caso.numero ? `Processo nº: ${caso.numero}` : ""}
${caso.reclamada ? `Reclamada: ${caso.reclamada}` : ""}

CLÁUSULA 2ª – DOS HONORÁRIOS
Os honorários advocatícios são fixados em ${caso.valor ? `R$ ${caso.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "________"}, a serem pagos conforme acordo entre as partes, acrescidos de 20% (vinte por cento) sobre o valor obtido em eventual acordo ou condenação judicial.

CLÁUSULA 3ª – DAS OBRIGAÇÕES DO CONTRATANTE
3.1. Fornecer todos os documentos necessários à instrução do processo;
3.2. Comunicar ao CONTRATADO quaisquer fatos relevantes ao caso;
3.3. Comparecer às audiências e atos processuais quando intimado;
3.4. Efetuar o pagamento dos honorários nos prazos avençados.

CLÁUSULA 4ª – DAS OBRIGAÇÕES DO CONTRATADO
4.1. Patrocinar diligentemente os interesses do CONTRATANTE;
4.2. Manter o CONTRATANTE informado sobre o andamento do processo;
4.3. Zelar pelo sigilo profissional.

CLÁUSULA 5ª – DO PRAZO
O presente contrato vigorará pelo prazo necessário à conclusão do serviço contratado, podendo ser rescindido por qualquer das partes mediante notificação prévia de 30 (trinta) dias.

CLÁUSULA 6ª – DO FORO
Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste instrumento.

São Paulo/SP, ${hoje}.

_____________________________________________
${caso.cliente.nome}
CPF: ${caso.cliente.cpf}
CONTRATANTE

_____________________________________________
HENRIQUE CHAHINE
OAB/SP 481.888 | CPF: 372.323.928-50
CONTRATADO
HENRIQUE CHAHINE ADVOGADOS
CNPJ: 58.044.571/0001-08`;
  } else {
    return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 });
  }

  const documento = await prisma.documento.create({
    data: {
      casoId,
      tipo: tipo as never,
      nome,
      conteudo,
    },
  });

  return NextResponse.json({ documento, conteudo }, { status: 201 });
}
