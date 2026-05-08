import { request } from "./http";
import type { GrupoAlimentarDTO } from "../types/grupoAlimentar";

export function listarGruposAlimentares(): Promise<GrupoAlimentarDTO[]> {
  return request<GrupoAlimentarDTO[]>("/grupoalimentar");
}
