import type { BairroDTO } from "./bairro";

export type ClienteDTO = {
  codigo: number;
  nome: string;
  RG: string;
  CPF: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: BairroDTO;
  pontoReferencia: string;
};

export type EnderecoCepDTO = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export type ClienteFormData = {
  codigo: number;
  nome: string;
  RG: string;
  CPF: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairroCodigo: string;
  pontoReferencia: string;
};
