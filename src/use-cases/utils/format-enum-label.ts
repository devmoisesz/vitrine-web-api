const ENUM_LABELS: Record<string, string> = {
  USER: "Usuário",
  ADMIN: "Administrador",

  PROPRIETARIO: "Proprietário",
  FUNCIONARIO: "Funcionário",

  ATIVA: "Ativa",
  INATIVA: "Inativa",

  ATIVO: "Ativo",
  INATIVO: "Inativo",
  CONCLUIDO: "Concluído",
};

/**
 * Recebe qualquer valor de Enum do Prisma e retorna o texto formatado para o Frontend.
 * Caso o valor não exista no dicionário, retorna o próprio valor original por segurança.
 */

export function formatEnumLabel(value: string | undefined | null): string {
  if (!value) {
    return "";
  }

  // Busca a formatação no dicionário ou faz o fallback para o valor bruto
  return ENUM_LABELS[value] ?? value;
}