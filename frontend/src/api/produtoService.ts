import { request } from "./http";
import type { ProdutoDTO } from "../types/produto";

export function listarProdutos(): Promise<ProdutoDTO[]> {
  return request<ProdutoDTO[]>("/produto");
}

export function salvarProduto(produto: ProdutoDTO): Promise<ProdutoDTO> {
  const method = produto.codigo > 0 ? "PUT" : "POST";

  return request<ProdutoDTO>("/produto", {
    method,
    body: JSON.stringify(produto),
  });
}

export function excluirProduto(codigo: number): Promise<void> {
  return request<void>(`/produto/${codigo}`, {
    method: "DELETE",
  });
}
