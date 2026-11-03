export interface CalculoIpvaResult {
  valorIpva: number;
  dataIpva: Date;
  isentoSetorPublico: boolean;
  observacao: string;
}

export class FipeService {
  async consultarValorFipe(codigoFipe: string, anoModelo?: number): Promise<number | null> {
    const cleanCode = codigoFipe.trim();
    if (!cleanCode) return null;

    try {
      // shortcut: consulta direta pelo codigo FIPE na BrasilAPI/Parallelum com timeout de 5s, usar cache se volume crescer
      const response = await fetch(
        `https://brasilapi.com.br/api/fipe/preco/v1/${encodeURIComponent(cleanCode)}`,
        { signal: AbortSignal.timeout(5000) },
      );

      if (!response.ok) return null;

      const items = (await response.json()) as Array<{ valor?: string; anoModelo?: number }>;
      if (!Array.isArray(items) || items.length === 0) return null;

      const match = (anoModelo ? items.find((i) => i.anoModelo === anoModelo) : undefined) ?? items[0];
      if (!match?.valor) return null;

      const parsed = Number(
        match.valor
          .replace(/[^\d,.-]/g, '')
          .replace(/\./g, '')
          .replace(',', '.'),
      );

      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    } catch {
      return null;
    }
  }

  calcularProximoIpva(valorVenal: number, finalPlaca: string): CalculoIpvaResult {
    const valorBase = Number.isFinite(valorVenal) && valorVenal > 0 ? valorVenal : 0;
    const valorIpva = Number((valorBase * 0.04).toFixed(2));

    const digits = finalPlaca.replace(/\D/g, '');
    const lastDigit = digits.length > 0 ? Number(digits[digits.length - 1]) : 0;
    // Mapeia final 1..9 para meses Jan..Set (0..8) e final 0 para Out (9), dia 15
    const targetMonth = lastDigit === 0 ? 9 : lastDigit - 1;

    const now = new Date();
    let dataIpva = new Date(Date.UTC(now.getUTCFullYear(), targetMonth, 15));
    if (dataIpva <= now) {
      dataIpva = new Date(Date.UTC(now.getUTCFullYear() + 1, targetMonth, 15));
    }

    return {
      valorIpva,
      dataIpva,
      isentoSetorPublico: true,
      observacao:
        'Veículo oficial de setor público (isento de recolhimento, valor estimado de 4% para controle orçamentário)',
    };
  }

  async obterCalculoIpva(params: {
    placa: string;
    codigo_fipe?: string;
    valor_venal?: number;
    ano_modelo?: number;
  }): Promise<CalculoIpvaResult | null> {
    let valorVenal: number | null = null;

    if (params.codigo_fipe) {
      valorVenal = await this.consultarValorFipe(params.codigo_fipe, params.ano_modelo);
    }

    if ((valorVenal === null || valorVenal <= 0) && typeof params.valor_venal === 'number') {
      valorVenal = params.valor_venal;
    }

    if (valorVenal === null || valorVenal <= 0) {
      const calculoData = this.calcularProximoIpva(0, params.placa);
      return { ...calculoData, valorIpva: 0 };
    }

    return this.calcularProximoIpva(valorVenal, params.placa);
  }
}

export const fipeService = new FipeService();
