export class Slug {
  /**
   * Recebe uma string e a normaliza como um slug (string pura).
   * Exemplo: "Camisetas do João & Cia!" => "camisetas-do-joao-cia"
   */
  static createFromText(text: string): string {
    return text
      .normalize('NFKD') // Remove acentuações (ex: "ã" vira "a")
      .toLowerCase() // Tudo em minúsculo
      .trim() // Remove espaços inúteis nas pontas
      .replace(/\s+/g, '-') // Substitui espaços por hifens
      .replace(/[^\w-]+/g, '') // Remove caracteres especiais restantes
      .replace(/_/g, '-') // Substitui underlines por hifens
      .replace(/--+/g, '-') // Evita hifens duplicados ("--")
      .replace(/-$/g, ''); // Remove hifens que sobraram no final
  }
}