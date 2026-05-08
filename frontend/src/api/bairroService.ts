import { request } from "./http";
import type { BairroDTO } from "../types/bairro";

export function listarBairros(): Promise<BairroDTO[]> {
  return request<BairroDTO[]>("/bairro");
}

export function salvarBairro(bairro: BairroDTO): Promise<BairroDTO> {
  const method = bairro.codigo > 0 ? "PUT" : "POST";

  return request<BairroDTO>("/bairro", {
    method,
    body: JSON.stringify(bairro),
  });
}

export function excluirBairro(codigo: number): Promise<void> {
  return request<void>(`/bairro/${codigo}`, {
    method: "DELETE",
  });
}
