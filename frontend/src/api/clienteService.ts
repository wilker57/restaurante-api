import { request } from "./http";
import type { ClienteDTO, EnderecoCepDTO } from "../types/cliente";

export function listarClientes(): Promise<ClienteDTO[]> {
  return request<ClienteDTO[]>("/cliente");
}

export function consultarCep(cep: string): Promise<EnderecoCepDTO> {
  return request<EnderecoCepDTO>("/cliente/cep", {
    method: "POST",
    body: JSON.stringify({ cep }),
  });
}

export function salvarCliente(cliente: ClienteDTO): Promise<ClienteDTO> {
  const method = cliente.codigo > 0 ? "PUT" : "POST";

  return request<ClienteDTO>("/cliente", {
    method,
    body: JSON.stringify(cliente),
  });
}

export function excluirCliente(codigo: number): Promise<void> {
  return request<void>(`/cliente/${codigo}`, {
    method: "DELETE",
  });
}
