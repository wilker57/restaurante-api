import { request } from "./http";
import type { MovimentoEstoqueDTO, RegistroEstoqueDTO } from "../types/estoque";

export function listarTiposMovimento(): Promise<MovimentoEstoqueDTO[]> {
  return request<MovimentoEstoqueDTO[]>("/movimento/tipos");
}

export function listarRegistrosPorMovimento(
  movimento: MovimentoEstoqueDTO,
  data?: string
): Promise<RegistroEstoqueDTO[]> {
  const path = data ? `/movimento/tipo/${movimento}/data/${data}` : `/movimento/tipo/${movimento}`;

  return request<RegistroEstoqueDTO[]>(path);
}

export function buscarRegistroPorCodigo(codigo: number): Promise<RegistroEstoqueDTO> {
  return request<RegistroEstoqueDTO>(`/movimento/codigo/${codigo}`);
}

export function salvarRegistroEstoque(registro: RegistroEstoqueDTO): Promise<RegistroEstoqueDTO> {
  const method = registro.codigo > 0 ? "PUT" : "POST";

  return request<RegistroEstoqueDTO>("/movimento", {
    method,
    body: JSON.stringify(registro),
  });
}

export function excluirRegistroEstoque(registro: RegistroEstoqueDTO): Promise<RegistroEstoqueDTO> {
  return request<RegistroEstoqueDTO>(`/movimento/${registro.codigo}`, {
    method: "DELETE",
  });
}
