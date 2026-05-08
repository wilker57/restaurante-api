import { FormEvent, useEffect, useMemo, useState } from "react";
import { excluirProduto, listarProdutos, salvarProduto } from "./api/produtoService";
import { listarGruposAlimentares } from "./api/grupoAlimentarService";
import type { GrupoAlimentarDTO } from "./types/grupoAlimentar";
import type { ProdutoDTO, ProdutoFormData } from "./types/produto";

const produtoInicial: ProdutoFormData = {
  codigo: 0,
  codigoBarras: "",
  nome: "",
  custoUnidade: "",
  valorEnergetico: "0",
  estoque: "0",
  estoqueMinimo: "0",
  grupoAlimentarCodigo: "",
};

function App() {
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [grupos, setGrupos] = useState<GrupoAlimentarDTO[]>([]);
  const [form, setForm] = useState<ProdutoFormData>(produtoInicial);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const produtosFiltrados = useMemo(() => {
    const termo = filtro.trim().toLowerCase();

    if (!termo) {
      return produtos;
    }

    return produtos.filter((produto) =>
      [produto.nome, produto.codigoBarras, produto.grupoAlimentar?.nome]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termo))
    );
  }, [filtro, produtos]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      setErro("");
      const [produtosResposta, gruposResposta] = await Promise.all([
        listarProdutos(),
        listarGruposAlimentares(),
      ]);
      setProdutos(produtosResposta);
      setGrupos(gruposResposta);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  function atualizarCampo(campo: keyof ProdutoFormData, valor: string) {
    setForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  function montarProduto(): ProdutoDTO {
    const grupoSelecionado = grupos.find(
      (grupo) => grupo.codigo === Number(form.grupoAlimentarCodigo)
    );

    if (!grupoSelecionado) {
      throw new Error("Selecione um grupo alimentar.");
    }

    return {
      codigo: form.codigo,
      codigoBarras: form.codigoBarras.trim(),
      nome: form.nome.trim(),
      custoUnidade: Number(form.custoUnidade),
      valorEnergetico: Number(form.valorEnergetico),
      estoque: Number(form.estoque),
      estoqueMinimo: Number(form.estoqueMinimo),
      grupoAlimentar: grupoSelecionado,
    };
  }

  function validarFormulario() {
    if (form.nome.trim().length < 3) {
      throw new Error("Informe um nome com pelo menos 3 caracteres.");
    }

    if (Number(form.custoUnidade) <= 0) {
      throw new Error("Informe um custo por unidade maior que zero.");
    }

    if (Number(form.valorEnergetico) < 0 || Number(form.estoque) < 0 || Number(form.estoqueMinimo) < 0) {
      throw new Error("Valores numericos nao podem ser negativos.");
    }
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");
      setSucesso("");
      validarFormulario();

      await salvarProduto(montarProduto());
      setSucesso(form.codigo > 0 ? "Produto atualizado." : "Produto cadastrado.");
      setForm(produtoInicial);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar produto.");
    } finally {
      setSalvando(false);
    }
  }

  function editarProduto(produto: ProdutoDTO) {
    setErro("");
    setSucesso("");
    setForm({
      codigo: produto.codigo,
      codigoBarras: produto.codigoBarras ?? "",
      nome: produto.nome,
      custoUnidade: String(produto.custoUnidade),
      valorEnergetico: String(produto.valorEnergetico),
      estoque: String(produto.estoque),
      estoqueMinimo: String(produto.estoqueMinimo),
      grupoAlimentarCodigo: String(produto.grupoAlimentar?.codigo ?? ""),
    });
  }

  async function removerProduto(produto: ProdutoDTO) {
    const confirmou = window.confirm(`Excluir o produto "${produto.nome}"?`);

    if (!confirmou) {
      return;
    }

    try {
      setErro("");
      setSucesso("");
      await excluirProduto(produto.codigo);
      setSucesso("Produto excluido.");
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir produto.");
    }
  }

  return (
    <main className="app-shell">
      <section className="page-heading">
        <div>
          <span className="eyebrow">CRUD Produto</span>
          <h1>Produtos do restaurante</h1>
        </div>
        <button className="secondary-button" type="button" onClick={carregarDados}>
          Atualizar
        </button>
      </section>

      {(erro || sucesso) && (
        <div className={erro ? "alert alert-error" : "alert alert-success"}>
          {erro || sucesso}
        </div>
      )}

      <section className="workspace">
        <form className="produto-form" onSubmit={enviarFormulario}>
          <div className="form-header">
            <h2>{form.codigo > 0 ? "Editar produto" : "Novo produto"}</h2>
            {form.codigo > 0 && (
              <button className="text-button" type="button" onClick={() => setForm(produtoInicial)}>
                Cancelar edicao
              </button>
            )}
          </div>

          <label>
            Nome
            <input
              required
              minLength={3}
              value={form.nome}
              onChange={(event) => atualizarCampo("nome", event.target.value)}
            />
          </label>

          <label>
            Grupo alimentar
            <select
              required
              value={form.grupoAlimentarCodigo}
              onChange={(event) => atualizarCampo("grupoAlimentarCodigo", event.target.value)}
            >
              <option value="">Selecione</option>
              {grupos.map((grupo) => (
                <option key={grupo.codigo} value={grupo.codigo}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Codigo de barras
            <input
              value={form.codigoBarras}
              onChange={(event) => atualizarCampo("codigoBarras", event.target.value)}
            />
          </label>

          <div className="form-grid">
            <label>
              Custo unidade
              <input
                required
                min="0.01"
                step="0.01"
                type="number"
                value={form.custoUnidade}
                onChange={(event) => atualizarCampo("custoUnidade", event.target.value)}
              />
            </label>

            <label>
              Valor energetico
              <input
                min="0"
                type="number"
                value={form.valorEnergetico}
                onChange={(event) => atualizarCampo("valorEnergetico", event.target.value)}
              />
            </label>

            <label>
              Estoque
              <input
                min="0"
                type="number"
                value={form.estoque}
                onChange={(event) => atualizarCampo("estoque", event.target.value)}
              />
            </label>

            <label>
              Estoque minimo
              <input
                min="0"
                type="number"
                value={form.estoqueMinimo}
                onChange={(event) => atualizarCampo("estoqueMinimo", event.target.value)}
              />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : form.codigo > 0 ? "Salvar alteracoes" : "Cadastrar produto"}
          </button>
        </form>

        <section className="produto-list">
          <div className="list-header">
            <div>
              <h2>Produtos cadastrados</h2>
              <p>{produtos.length} produto(s)</p>
            </div>
            <input
              aria-label="Filtrar produtos"
              placeholder="Filtrar por nome, codigo ou grupo"
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty-state">Carregando produtos...</div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="empty-state">Nenhum produto encontrado.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Produto</th>
                    <th>Grupo</th>
                    <th>Custo</th>
                    <th>Estoque</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((produto) => (
                    <tr key={produto.codigo}>
                      <td>{produto.codigo}</td>
                      <td>
                        <strong>{produto.nome}</strong>
                        <span>{produto.codigoBarras || "Sem codigo de barras"}</span>
                      </td>
                      <td>{produto.grupoAlimentar?.nome ?? "-"}</td>
                      <td>
                        {produto.custoUnidade.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td>
                        <span className={produto.estoque <= produto.estoqueMinimo ? "stock-low" : ""}>
                          {produto.estoque}
                        </span>
                        <small> min. {produto.estoqueMinimo}</small>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" onClick={() => editarProduto(produto)}>
                            Editar
                          </button>
                          <button type="button" className="danger-button" onClick={() => removerProduto(produto)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
