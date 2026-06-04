export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function statusCasoLabel(status: string): string {
  const labels: Record<string, string> = {
    NOVO: "Novo",
    PRE_JUDICIAL: "Pré-Judicial",
    ATIVO: "Ativo",
    ACORDO: "Acordo",
    ENCERRADO: "Encerrado",
  };
  return labels[status] || status;
}

export function statusCasoColor(status: string): string {
  const colors: Record<string, string> = {
    NOVO: "bg-blue-100 text-blue-800",
    PRE_JUDICIAL: "bg-yellow-100 text-yellow-800",
    ATIVO: "bg-green-100 text-green-800",
    ACORDO: "bg-purple-100 text-purple-800",
    ENCERRADO: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function statusPreJudicialLabel(status: string): string {
  const labels: Record<string, string> = {
    AGUARDANDO_ENTREVISTA: "Aguardando Entrevista",
    ENTREVISTA_REALIZADA: "Entrevista Realizada",
    DOCS_PENDENTES: "Docs. Pendentes",
    DOCS_COMPLETOS: "Docs. Completos",
    INICIAL_EM_ELABORACAO: "Inicial em Elaboração",
    INICIAL_ENTREGUE: "Inicial Entregue",
  };
  return labels[status] || status;
}

export function statusAcordoLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDENTE: "Pendente",
    ACEITO: "Aceito",
    RECUSADO: "Recusado",
    EXPIRADO: "Expirado",
  };
  return labels[status] || status;
}

export function statusAcordoColor(status: string): string {
  const colors: Record<string, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-800",
    ACEITO: "bg-green-100 text-green-800",
    RECUSADO: "bg-red-100 text-red-800",
    EXPIRADO: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function tipoAcordoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    PROPOSTA_ENVIADA: "Proposta Enviada",
    PROPOSTA_RECEBIDA: "Proposta Recebida",
    CONTRAPROPOSTA: "Contraproposta",
  };
  return labels[tipo] || tipo;
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function isDueSoon(
  date: Date | string | null | undefined,
  days = 3
): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}
