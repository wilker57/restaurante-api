import type { ProdutoDTO } from "./produto";

export type MovimentoEstoqueDTO = "PRODUCAO" | "COMPRA" | "VENCIMENTO" | "DANIFICADO";

export type RegistroEstoqueDTO = {
  codigo: number;
  produto: ProdutoDTO;
  movimento: MovimentoEstoqueDTO;
  data: string;
  quantidade: number;
};

export type RegistroEstoqueFormData = {
  codigo: number;
  produtoCodigo: string;
  movimento: MovimentoEstoqueDTO;
  data: string;
  quantidade: string;
};

export type EstoqueBaixoRelatorioDTO = {
  codigoProduto: number;
  nomeProduto: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  quantidadeParaReposicao: number;
};

export type SaldoEstoqueRelatorioDTO = {
  codigoProduto: number;
  nomeProduto: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  custoUnidade: number;
  valorTotalEstoque: number;
  situacao: string;
};

export type PerdaEstoqueRelatorioDTO = {
  codigoProduto: number;
  nomeProduto: string;
  movimento: string;
  quantidadePerdida: number;
  custoEstimado: number;
};

export type SaidaEstoqueRelatorioDTO = {
  codigoProduto: number;
  nomeProduto: string;
  movimento: string;
  quantidade: number;
  custoEstimado: number;
};
