import type { GrupoAlimentarDTO } from "./grupoAlimentar";

export type ProdutoDTO = {
  codigo: number;
  codigoBarras: string;
  nome: string;
  custoUnidade: number;
  valorEnergetico: number;
  estoque: number;
  estoqueMinimo: number;
  grupoAlimentar: GrupoAlimentarDTO;
};

export type ProdutoFormData = {
  codigo: number;
  codigoBarras: string;
  nome: string;
  custoUnidade: string;
  valorEnergetico: string;
  estoque: string;
  estoqueMinimo: string;
  grupoAlimentarCodigo: string;
};
