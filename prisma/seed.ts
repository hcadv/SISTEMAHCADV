import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("3082Chahine@", 12);
  const admin = await prisma.user.upsert({
    where: { email: "contato@hca.adv.br" },
    update: {},
    create: {
      name: "Henrique Chahine",
      email: "contato@hca.adv.br",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Sample client 1
  const cliente1 = await prisma.cliente.upsert({
    where: { cpf: "123.456.789-00" },
    update: {},
    create: {
      nome: "João da Silva Santos",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      email: "joao.silva@email.com",
      telefone: "(11) 91234-5678",
      whatsapp: "(11) 91234-5678",
      endereco: "Rua das Flores, 100 - Vila Madalena, São Paulo/SP",
      profissao: "Operador de Máquinas",
      estadoCivil: "Casado",
      dataNascimento: new Date("1985-03-15"),
      observacoes: "Cliente indicado por familiar. Demitido após 8 anos.",
    },
  });

  // Sample client 2
  const cliente2 = await prisma.cliente.upsert({
    where: { cpf: "987.654.321-00" },
    update: {},
    create: {
      nome: "Maria Aparecida Ferreira",
      cpf: "987.654.321-00",
      rg: "98.765.432-1",
      email: "maria.ferreira@email.com",
      telefone: "(11) 98765-4321",
      whatsapp: "(11) 98765-4321",
      endereco: "Av. Paulista, 500 - Bela Vista, São Paulo/SP",
      profissao: "Auxiliar Administrativo",
      estadoCivil: "Solteira",
      dataNascimento: new Date("1992-07-22"),
      observacoes: "Assédio moral no ambiente de trabalho.",
    },
  });

  // Sample case 1
  const caso1 = await prisma.caso.upsert({
    where: { id: "caso-sample-001" },
    update: {},
    create: {
      id: "caso-sample-001",
      numero: "1000123-45.2024.5.02.0001",
      titulo: "Reclamação Trabalhista - João Santos x Empresa XYZ Ltda",
      descricao:
        "Verbas rescisórias não pagas, horas extras não remuneradas, FGTS não depositado durante todo período.",
      status: "ATIVO",
      vara: "1ª Vara do Trabalho de São Paulo",
      reclamada: "Empresa XYZ Ltda",
      valor: 45000.0,
      dataDistribuicao: new Date("2024-03-10"),
      clienteId: cliente1.id,
    },
  });

  // Sample pre-judicial for case 1
  await prisma.preJudicial.upsert({
    where: { casoId: caso1.id },
    update: {},
    create: {
      casoId: caso1.id,
      status: "DOCS_COMPLETOS",
      dataEntrevista: new Date("2024-02-15"),
      dataLimiteEntrevista: new Date("2024-02-20"),
      dataLimiteDocs: new Date("2024-03-01"),
      dataLimiteInicial: new Date("2024-03-15"),
      observacoesEntrevista:
        "Cliente relatou demissão sem justa causa após 8 anos. Possui CTPS, contracheques e cartão ponto.",
      docsRecebidos: ["CTPS", "Contracheques", "Cartão Ponto", "TRCT"],
      observacoes: "Documentação completa. Petição inicial em elaboração.",
    },
  });

  // Sample case 2
  const caso2 = await prisma.caso.create({
    data: {
      titulo: "Reclamação Trabalhista - Maria Ferreira x Comércio ABC",
      descricao:
        "Assédio moral, horas extras não pagas, adicional noturno não remunerado.",
      status: "PRE_JUDICIAL",
      reclamada: "Comércio ABC S/A",
      valor: 28000.0,
      clienteId: cliente2.id,
    },
  });

  // Pre-judicial for case 2
  await prisma.preJudicial.create({
    data: {
      casoId: caso2.id,
      status: "AGUARDANDO_ENTREVISTA",
      dataLimiteEntrevista: new Date(
        new Date().setDate(new Date().getDate() + 7)
      ),
      observacoes: "Cliente recém cadastrada. Agendar entrevista.",
    },
  });

  // Sample acordo for case 1
  await prisma.acordo.create({
    data: {
      casoId: caso1.id,
      tipo: "PROPOSTA_RECEBIDA",
      valor: 25000.0,
      descricao:
        "Proposta de acordo extrajudicial enviada pela empresa reclamada.",
      status: "PENDENTE",
      dataEnvio: new Date("2024-04-15"),
      observacoes: "Proposta abaixo do esperado. Aguardando análise do cliente.",
    },
  });

  console.log("Seed concluído com sucesso!");
  console.log(`- Clientes criados: ${cliente1.nome}, ${cliente2.nome}`);
  console.log(`- Casos criados: 2`);
  console.log(`- Acordos criados: 1`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
