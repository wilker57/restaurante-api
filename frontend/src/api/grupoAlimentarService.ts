import { request } from "./http";
import type { GrupoAlimentarDTO } from "../types/grupoAlimentar";

export function listarGruposAlimentares(): Promise<GrupoAlimentarDTO[]> {
  return request<GrupoAlimentarDTO[]>("/grupoalimentar");
}

export function salvarGrupoAlimentar(grupo: GrupoAlimentarDTO): Promise<GrupoAlimentarDTO> {
  const method = grupo.codigo > 0 ? "PUT" : "POST";

  return request<GrupoAlimentarDTO>("/grupoalimentar", {
    method,
    body: JSON.stringify(grupo),
  });
}

export function excluirGrupoAlimentar(codigo: number): Promise<void> {
  return request<void>(`/grupoalimentar/${codigo}`, {
    method: "DELETE",
  });
}
