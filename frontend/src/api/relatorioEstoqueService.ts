import { request } from "./http";
import type {
  EstoqueBaixoRelatorioDTO,
  PerdaEstoqueRelatorioDTO,
  SaidaEstoqueRelatorioDTO,
  SaldoEstoqueRelatorioDTO,
} from "../types/estoque";

export function relatorioEstoqueBaixo(): Promise<EstoqueBaixoRelatorioDTO[]> {
  return request<EstoqueBaixoRelatorioDTO[]>("/relatorio/estoque/baixo");
}

export function relatorioSaldoEstoque(): Promise<SaldoEstoqueRelatorioDTO[]> {
  return request<SaldoEstoqueRelatorioDTO[]>("/relatorio/estoque/saldo");
}

export function relatorioPerdas(
  inicio: string,
  fim: string
): Promise<PerdaEstoqueRelatorioDTO[]> {
  return request<PerdaEstoqueRelatorioDTO[]>(`/relatorio/estoque/perdas?inicio=${inicio}&fim=${fim}`);
}

export function relatorioSaidas(
  inicio: string,
  fim: string
): Promise<SaidaEstoqueRelatorioDTO[]> {
  return request<SaidaEstoqueRelatorioDTO[]>(`/relatorio/estoque/saidas?inicio=${inicio}&fim=${fim}`);
}
