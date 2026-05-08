import { FormEvent, useEffect, useMemo, useState } from "react";
import { excluirProduto, listarProdutos, salvarProduto } from "./api/produtoService";
import {
  excluirGrupoAlimentar,
  listarGruposAlimentares,
  salvarGrupoAlimentar,
} from "./api/grupoAlimentarService";
import {
  excluirRegistroEstoque,
  listarRegistrosPorMovimento,
  listarTiposMovimento,
  salvarRegistroEstoque,
} from "./api/estoqueService";
import {
  relatorioEstoqueBaixo,
  relatorioPerdas,
  relatorioSaidas,
  relatorioSaldoEstoque,
} from "./api/relatorioEstoqueService";
import { excluirBairro, listarBairros, salvarBairro } from "./api/bairroService";
import { consultarCep, excluirCliente, listarClientes, salvarCliente } from "./api/clienteService";
import type { GrupoAlimentarDTO, GrupoAlimentarFormData } from "./types/grupoAlimentar";
import type { BairroDTO, BairroFormData } from "./types/bairro";
import type { ClienteDTO, ClienteFormData } from "./types/cliente";
import type {
  EstoqueBaixoRelatorioDTO,
  MovimentoEstoqueDTO,
  PerdaEstoqueRelatorioDTO,
  RegistroEstoqueDTO,
  RegistroEstoqueFormData,
  SaidaEstoqueRelatorioDTO,
  SaldoEstoqueRelatorioDTO,
} from "./types/estoque";
import type { ProdutoDTO, ProdutoFormData } from "./types/produto";

const hoje = formatarDataInput(new Date());
const primeiroDiaMes = formatarDataInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

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

const grupoInicial: GrupoAlimentarFormData = {
  codigo: 0,
  nome: "",
};

const registroInicial: RegistroEstoqueFormData = {
  codigo: 0,
  produtoCodigo: "",
  movimento: "COMPRA",
  data: hoje,
  quantidade: "1",
};

const bairroInicial: BairroFormData = {
  codigo: 0,
  nome: "",
  custoEntrega: "",
};

const clienteInicial: ClienteFormData = {
  codigo: 0,
  nome: "",
  RG: "",
  CPF: "",
  telefone: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairroCodigo: "",
  pontoReferencia: "",
};

type AbaAtiva =
  | "produtos"
  | "grupos"
  | "registro"
  | "movimentacao"
  | "relatorios"
  | "bairros"
  | "clientes";
type TipoRelatorio = "saldo" | "baixo" | "perdas" | "saidas";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarDataInput(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarMovimento(movimento: string) {
  const labels: Record<string, string> = {
    PRODUCAO: "Producao",
    COMPRA: "Compra",
    VENCIMENTO: "Vencimento",
    DANIFICADO: "Danificado",
  };

  return labels[movimento] ?? movimento;
}

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("produtos");
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [grupos, setGrupos] = useState<GrupoAlimentarDTO[]>([]);
  const [bairros, setBairros] = useState<BairroDTO[]>([]);
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [tiposMovimento, setTiposMovimento] = useState<MovimentoEstoqueDTO[]>(["COMPRA"]);
  const [registros, setRegistros] = useState<RegistroEstoqueDTO[]>([]);

  const [produtoForm, setProdutoForm] = useState<ProdutoFormData>(produtoInicial);
  const [grupoForm, setGrupoForm] = useState<GrupoAlimentarFormData>(grupoInicial);
  const [registroForm, setRegistroForm] = useState<RegistroEstoqueFormData>(registroInicial);
  const [bairroForm, setBairroForm] = useState<BairroFormData>(bairroInicial);
  const [clienteForm, setClienteForm] = useState<ClienteFormData>(clienteInicial);

  const [filtroProduto, setFiltroProduto] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroBairro, setFiltroBairro] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroRegistroMovimento, setFiltroRegistroMovimento] = useState<MovimentoEstoqueDTO>("COMPRA");
  const [filtroRegistroData, setFiltroRegistroData] = useState("");
  const [filtroMovimentacao, setFiltroMovimentacao] = useState<MovimentoEstoqueDTO>("COMPRA");
  const [filtroMovimentacaoData, setFiltroMovimentacaoData] = useState("");
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("saldo");
  const [relatorioInicio, setRelatorioInicio] = useState(primeiroDiaMes);
  const [relatorioFim, setRelatorioFim] = useState(hoje);

  const [saldoRelatorio, setSaldoRelatorio] = useState<SaldoEstoqueRelatorioDTO[]>([]);
  const [baixoRelatorio, setBaixoRelatorio] = useState<EstoqueBaixoRelatorioDTO[]>([]);
  const [perdasRelatorio, setPerdasRelatorio] = useState<PerdaEstoqueRelatorioDTO[]>([]);
  const [saidasRelatorio, setSaidasRelatorio] = useState<SaidaEstoqueRelatorioDTO[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);
  const [salvandoRegistro, setSalvandoRegistro] = useState(false);
  const [salvandoBairro, setSalvandoBairro] = useState(false);
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const produtosFiltrados = useMemo(() => {
    const termo = filtroProduto.trim().toLowerCase();

    if (!termo) {
      return produtos;
    }

    return produtos.filter((produto) =>
      [produto.nome, produto.codigoBarras, produto.grupoAlimentar?.nome]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termo))
    );
  }, [filtroProduto, produtos]);

  const gruposFiltrados = useMemo(() => {
    const termo = filtroGrupo.trim().toLowerCase();

    if (!termo) {
      return grupos;
    }

    return grupos.filter((grupo) => grupo.nome.toLowerCase().includes(termo));
  }, [filtroGrupo, grupos]);

  const bairrosFiltrados = useMemo(() => {
    const termo = filtroBairro.trim().toLowerCase();

    if (!termo) {
      return bairros;
    }

    return bairros.filter((bairro) => bairro.nome.toLowerCase().includes(termo));
  }, [bairros, filtroBairro]);

  const clientesFiltrados = useMemo(() => {
    const termo = filtroCliente.trim().toLowerCase();

    if (!termo) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      [cliente.nome, cliente.CPF, cliente.telefone, cliente.bairro?.nome]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termo))
    );
  }, [clientes, filtroCliente]);

  const registrosMovimentacao = useMemo(
    () => registros.filter((registro) => registro.movimento === filtroMovimentacao),
    [filtroMovimentacao, registros]
  );

  const resumoMovimentacao = useMemo(() => {
    const totalQuantidade = registrosMovimentacao.reduce((total, registro) => total + registro.quantidade, 0);
    const custoEstimado = registrosMovimentacao.reduce(
      (total, registro) => total + registro.quantidade * (registro.produto?.custoUnidade ?? 0),
      0
    );

    return {
      totalRegistros: registrosMovimentacao.length,
      totalQuantidade,
      custoEstimado,
    };
  }, [registrosMovimentacao]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      setErro("");
      const [produtosResposta, gruposResposta, bairrosResposta, clientesResposta, tiposResposta] = await Promise.all([
        listarProdutos(),
        listarGruposAlimentares(),
        listarBairros(),
        listarClientes(),
        listarTiposMovimento(),
      ]);
      const tipos: MovimentoEstoqueDTO[] = tiposResposta.length > 0 ? tiposResposta : ["COMPRA"];
      setProdutos(produtosResposta);
      setGrupos(gruposResposta);
      setBairros(bairrosResposta);
      setClientes(clientesResposta);
      setTiposMovimento(tipos);
      await carregarRegistros(filtroRegistroMovimento, filtroRegistroData || undefined);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarRegistros(movimento: MovimentoEstoqueDTO, data?: string) {
    try {
      setLoadingRegistros(true);
      setErro("");
      const registrosResposta = await listarRegistrosPorMovimento(movimento, data);
      setRegistros(registrosResposta);
    } catch (error) {
      setRegistros([]);
      setErro(error instanceof Error ? error.message : "Erro ao carregar registros de estoque.");
    } finally {
      setLoadingRegistros(false);
    }
  }

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  function atualizarProdutoCampo(campo: keyof ProdutoFormData, valor: string) {
    setProdutoForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  function atualizarGrupoCampo(campo: keyof GrupoAlimentarFormData, valor: string) {
    setGrupoForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: campo === "codigo" ? Number(valor) : valor,
    }));
  }

  function atualizarRegistroCampo(campo: keyof RegistroEstoqueFormData, valor: string) {
    setRegistroForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  function atualizarBairroCampo(campo: keyof BairroFormData, valor: string) {
    setBairroForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: campo === "codigo" ? Number(valor) : valor,
    }));
  }

  function atualizarClienteCampo(campo: keyof ClienteFormData, valor: string) {
    setClienteForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  function montarProduto(): ProdutoDTO {
    const grupoSelecionado = grupos.find(
      (grupo) => grupo.codigo === Number(produtoForm.grupoAlimentarCodigo)
    );

    if (!grupoSelecionado) {
      throw new Error("Selecione um grupo alimentar.");
    }

    return {
      codigo: produtoForm.codigo,
      codigoBarras: produtoForm.codigoBarras.trim(),
      nome: produtoForm.nome.trim(),
      custoUnidade: Number(produtoForm.custoUnidade),
      valorEnergetico: Number(produtoForm.valorEnergetico),
      estoque: Number(produtoForm.estoque),
      estoqueMinimo: Number(produtoForm.estoqueMinimo),
      grupoAlimentar: grupoSelecionado,
    };
  }

  function montarGrupo(): GrupoAlimentarDTO {
    return {
      codigo: grupoForm.codigo,
      nome: grupoForm.nome.trim(),
    };
  }

  function montarRegistro(): RegistroEstoqueDTO {
    const produtoSelecionado = produtos.find(
      (produto) => produto.codigo === Number(registroForm.produtoCodigo)
    );

    if (!produtoSelecionado) {
      throw new Error("Selecione um produto.");
    }

    return {
      codigo: registroForm.codigo,
      produto: produtoSelecionado,
      movimento: registroForm.movimento,
      data: registroForm.data,
      quantidade: Number(registroForm.quantidade),
    };
  }

  function montarBairro(): BairroDTO {
    return {
      codigo: bairroForm.codigo,
      nome: bairroForm.nome.trim(),
      custoEntrega: Number(bairroForm.custoEntrega),
    };
  }

  function montarCliente(): ClienteDTO {
    const bairroSelecionado = bairros.find(
      (bairro) => bairro.codigo === Number(clienteForm.bairroCodigo)
    );

    if (!bairroSelecionado) {
      throw new Error("Selecione um bairro cadastrado.");
    }

    return {
      codigo: clienteForm.codigo,
      nome: clienteForm.nome.trim(),
      RG: clienteForm.RG.trim(),
      CPF: clienteForm.CPF.trim(),
      telefone: clienteForm.telefone.trim(),
      cep: clienteForm.cep.trim(),
      logradouro: clienteForm.logradouro.trim(),
      numero: clienteForm.numero.trim(),
      bairro: bairroSelecionado,
      pontoReferencia: clienteForm.pontoReferencia.trim(),
    };
  }

  function validarProduto() {
    if (produtoForm.nome.trim().length < 3) {
      throw new Error("Informe um nome de produto com pelo menos 3 caracteres.");
    }

    if (Number(produtoForm.custoUnidade) <= 0) {
      throw new Error("Informe um custo por unidade maior que zero.");
    }

    if (
      Number(produtoForm.valorEnergetico) < 0 ||
      Number(produtoForm.estoque) < 0 ||
      Number(produtoForm.estoqueMinimo) < 0
    ) {
      throw new Error("Valores numericos nao podem ser negativos.");
    }
  }

  function validarGrupo() {
    if (grupoForm.nome.trim().length < 3) {
      throw new Error("Informe um nome de grupo com pelo menos 3 caracteres.");
    }
  }

  function validarRegistro() {
    if (!registroForm.data) {
      throw new Error("Informe a data do movimento.");
    }

    if (Number(registroForm.quantidade) <= 0) {
      throw new Error("Informe uma quantidade maior que zero.");
    }
  }

  function validarBairro() {
    if (bairroForm.nome.trim().length < 3) {
      throw new Error("Informe um nome de bairro com pelo menos 3 caracteres.");
    }

    if (Number(bairroForm.custoEntrega) <= 0) {
      throw new Error("Informe um custo de entrega maior que zero.");
    }
  }

  function validarCliente() {
    if (clienteForm.nome.trim().length < 3) {
      throw new Error("Informe um nome de cliente com pelo menos 3 caracteres.");
    }

    if (!clienteForm.CPF.trim()) {
      throw new Error("Informe o CPF do cliente.");
    }

    if (!clienteForm.RG.trim()) {
      throw new Error("Informe o RG do cliente.");
    }

    if (clienteForm.CPF.replace(/\D/g, "").length < 11) {
      throw new Error("Informe um CPF com pelo menos 11 digitos.");
    }

    if (clienteForm.telefone.replace(/\D/g, "").length < 8) {
      throw new Error("Informe um telefone com pelo menos 8 digitos.");
    }

    if (!clienteForm.logradouro.trim()) {
      throw new Error("Informe o logradouro.");
    }

    if (!clienteForm.numero.trim()) {
      throw new Error("Informe o numero do endereco.");
    }
  }

  async function enviarProduto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvandoProduto(true);
      limparMensagens();
      validarProduto();

      await salvarProduto(montarProduto());
      setSucesso(produtoForm.codigo > 0 ? "Produto atualizado." : "Produto cadastrado.");
      setProdutoForm(produtoInicial);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar produto.");
    } finally {
      setSalvandoProduto(false);
    }
  }

  async function enviarGrupo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvandoGrupo(true);
      limparMensagens();
      validarGrupo();

      await salvarGrupoAlimentar(montarGrupo());
      setSucesso(grupoForm.codigo > 0 ? "Grupo alimentar atualizado." : "Grupo alimentar cadastrado.");
      setGrupoForm(grupoInicial);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar grupo alimentar.");
    } finally {
      setSalvandoGrupo(false);
    }
  }

  async function enviarRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvandoRegistro(true);
      limparMensagens();
      validarRegistro();

      await salvarRegistroEstoque(montarRegistro());
      setSucesso(registroForm.codigo > 0 ? "Registro de estoque atualizado." : "Registro de estoque cadastrado.");
      setRegistroForm({ ...registroInicial, movimento: registroForm.movimento, data: registroForm.data });
      await carregarDados();
      await carregarRegistros(filtroRegistroMovimento, filtroRegistroData || undefined);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar registro de estoque.");
    } finally {
      setSalvandoRegistro(false);
    }
  }

  async function enviarBairro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvandoBairro(true);
      limparMensagens();
      validarBairro();

      await salvarBairro(montarBairro());
      setSucesso(bairroForm.codigo > 0 ? "Bairro atualizado." : "Bairro cadastrado.");
      setBairroForm(bairroInicial);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar bairro.");
    } finally {
      setSalvandoBairro(false);
    }
  }

  async function enviarCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvandoCliente(true);
      limparMensagens();
      validarCliente();

      await salvarCliente(montarCliente());
      setSucesso(clienteForm.codigo > 0 ? "Cliente atualizado." : "Cliente cadastrado.");
      setClienteForm(clienteInicial);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar cliente.");
    } finally {
      setSalvandoCliente(false);
    }
  }

  function editarProduto(produto: ProdutoDTO) {
    limparMensagens();
    setAbaAtiva("produtos");
    setProdutoForm({
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

  function editarGrupo(grupo: GrupoAlimentarDTO) {
    limparMensagens();
    setAbaAtiva("grupos");
    setGrupoForm({
      codigo: grupo.codigo,
      nome: grupo.nome,
    });
  }

  function editarRegistro(registro: RegistroEstoqueDTO) {
    limparMensagens();
    setAbaAtiva("registro");
    setRegistroForm({
      codigo: registro.codigo,
      produtoCodigo: String(registro.produto?.codigo ?? ""),
      movimento: registro.movimento,
      data: registro.data,
      quantidade: String(registro.quantidade),
    });
  }

  function editarBairro(bairro: BairroDTO) {
    limparMensagens();
    setAbaAtiva("bairros");
    setBairroForm({
      codigo: bairro.codigo,
      nome: bairro.nome,
      custoEntrega: String(bairro.custoEntrega),
    });
  }

  function editarCliente(cliente: ClienteDTO) {
    limparMensagens();
    setAbaAtiva("clientes");
    setClienteForm({
      codigo: cliente.codigo,
      nome: cliente.nome,
      RG: cliente.RG ?? "",
      CPF: cliente.CPF ?? "",
      telefone: cliente.telefone ?? "",
      cep: cliente.cep ?? "",
      logradouro: cliente.logradouro ?? "",
      numero: cliente.numero ?? "",
      bairroCodigo: String(cliente.bairro?.codigo ?? ""),
      pontoReferencia: cliente.pontoReferencia ?? "",
    });
  }

  async function removerProduto(produto: ProdutoDTO) {
    const confirmou = window.confirm(`Excluir o produto "${produto.nome}"?`);

    if (!confirmou) {
      return;
    }

    try {
      limparMensagens();
      await excluirProduto(produto.codigo);
      setSucesso("Produto excluido.");
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir produto.");
    }
  }

  async function removerGrupo(grupo: GrupoAlimentarDTO) {
    const produtosDoGrupo = produtos.filter(
      (produto) => produto.grupoAlimentar?.codigo === grupo.codigo
    );

    if (produtosDoGrupo.length > 0) {
      setErro("Nao e possivel excluir um grupo vinculado a produtos.");
      setSucesso("");
      return;
    }

    const confirmou = window.confirm(`Excluir o grupo alimentar "${grupo.nome}"?`);

    if (!confirmou) {
      return;
    }

    try {
      limparMensagens();
      await excluirGrupoAlimentar(grupo.codigo);
      setSucesso("Grupo alimentar excluido.");
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir grupo alimentar.");
    }
  }

  async function removerRegistro(registro: RegistroEstoqueDTO) {
    const confirmou = window.confirm(`Excluir o registro ${registro.codigo}?`);

    if (!confirmou) {
      return;
    }

    try {
      limparMensagens();
      await excluirRegistroEstoque(registro);
      setSucesso("Registro de estoque excluido.");
      await carregarDados();
      await carregarRegistros(filtroRegistroMovimento, filtroRegistroData || undefined);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir registro de estoque.");
    }
  }

  async function removerBairro(bairro: BairroDTO) {
    const clientesDoBairro = clientes.filter((cliente) => cliente.bairro?.codigo === bairro.codigo);

    if (clientesDoBairro.length > 0) {
      setErro("Nao e possivel excluir um bairro vinculado a clientes.");
      setSucesso("");
      return;
    }

    const confirmou = window.confirm(`Excluir o bairro "${bairro.nome}"?`);

    if (!confirmou) {
      return;
    }

    try {
      limparMensagens();
      await excluirBairro(bairro.codigo);
      setSucesso("Bairro excluido.");
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir bairro.");
    }
  }

  async function removerCliente(cliente: ClienteDTO) {
    const confirmou = window.confirm(`Excluir o cliente "${cliente.nome}"?`);

    if (!confirmou) {
      return;
    }

    try {
      limparMensagens();
      await excluirCliente(cliente.codigo);
      setSucesso("Cliente excluido.");
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir cliente.");
    }
  }

  async function buscarCepCliente() {
    try {
      setBuscandoCep(true);
      limparMensagens();
      const endereco = await consultarCep(clienteForm.cep);
      const bairroCep = normalizarTexto(endereco.bairro);
      const bairroEncontrado = bairros.find((bairro) => {
        const bairroLocal = normalizarTexto(bairro.nome);

        return bairroLocal === bairroCep || bairroLocal.startsWith(bairroCep) || bairroCep.startsWith(bairroLocal);
      });

      setClienteForm((estadoAtual) => ({
        ...estadoAtual,
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        bairroCodigo: bairroEncontrado ? String(bairroEncontrado.codigo) : "",
      }));

      if (bairroEncontrado) {
        setSucesso(`CEP encontrado: ${endereco.localidade}/${endereco.uf}.`);
      } else {
        setErro(`CEP encontrado, mas o bairro "${endereco.bairro}" ainda nao esta cadastrado.`);
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao buscar CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function aplicarFiltroRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await carregarRegistros(filtroRegistroMovimento, filtroRegistroData || undefined);
  }

  async function aplicarFiltroMovimentacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await carregarRegistros(filtroMovimentacao, filtroMovimentacaoData || undefined);
  }

  async function gerarRelatorio(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    try {
      setLoadingRelatorio(true);
      limparMensagens();

      if ((tipoRelatorio === "perdas" || tipoRelatorio === "saidas") && (!relatorioInicio || !relatorioFim)) {
        throw new Error("Informe o periodo do relatorio.");
      }

      if (tipoRelatorio === "saldo") {
        setSaldoRelatorio(await relatorioSaldoEstoque());
      } else if (tipoRelatorio === "baixo") {
        setBaixoRelatorio(await relatorioEstoqueBaixo());
      } else if (tipoRelatorio === "perdas") {
        setPerdasRelatorio(await relatorioPerdas(relatorioInicio, relatorioFim));
      } else {
        setSaidasRelatorio(await relatorioSaidas(relatorioInicio, relatorioFim));
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao gerar relatorio.");
    } finally {
      setLoadingRelatorio(false);
    }
  }

  function quantidadeProdutosPorGrupo(codigoGrupo: number) {
    return produtos.filter((produto) => produto.grupoAlimentar?.codigo === codigoGrupo).length;
  }

  function quantidadeClientesPorBairro(codigoBairro: number) {
    return clientes.filter((cliente) => cliente.bairro?.codigo === codigoBairro).length;
  }

  function selecionarAba(aba: AbaAtiva) {
    setAbaAtiva(aba);
    limparMensagens();
  }

  return (
    <main className="app-shell">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Restaurante API</span>
          <h1>Gestao do restaurante</h1>
        </div>
        <button className="secondary-button" type="button" onClick={carregarDados}>
          Atualizar
        </button>
      </section>

      <nav className="tabs" aria-label="Modulos">
        <button className={abaAtiva === "produtos" ? "tab-button active" : "tab-button"} type="button" onClick={() => selecionarAba("produtos")}>
          Produtos <span>{produtos.length}</span>
        </button>
        <button className={abaAtiva === "grupos" ? "tab-button active" : "tab-button"} type="button" onClick={() => selecionarAba("grupos")}>
          Grupos alimentares <span>{grupos.length}</span>
        </button>
        <button className={abaAtiva === "bairros" ? "tab-button active" : "tab-button"} type="button" onClick={() => selecionarAba("bairros")}>
          Bairros <span>{bairros.length}</span>
        </button>
        <button className={abaAtiva === "clientes" ? "tab-button active" : "tab-button"} type="button" onClick={() => selecionarAba("clientes")}>
          Clientes <span>{clientes.length}</span>
        </button>
        <button className={abaAtiva === "registro" ? "tab-button active" : "tab-button"} type="button" onClick={() => selecionarAba("registro")}>
          Registro estoque <span>{registros.length}</span>
        </button>
        <button className={abaAtiva === "movimentacao" ? "tab-button active" : "tab-button"} type="button" onClick={() => selecionarAba("movimentacao")}>
          Movimentacao <span>{resumoMovimentacao.totalRegistros}</span>
        </button>
        <button className={abaAtiva === "relatorios" ? "tab-button active" : "tab-button"} type="button" onClick={() => selecionarAba("relatorios")}>
          Relatorios
        </button>
      </nav>

      {(erro || sucesso) && <div className={erro ? "alert alert-error" : "alert alert-success"}>{erro || sucesso}</div>}

      {abaAtiva === "produtos" && renderProdutos()}
      {abaAtiva === "grupos" && renderGrupos()}
      {abaAtiva === "bairros" && renderBairros()}
      {abaAtiva === "clientes" && renderClientes()}
      {abaAtiva === "registro" && renderRegistroEstoque()}
      {abaAtiva === "movimentacao" && renderMovimentacaoEstoque()}
      {abaAtiva === "relatorios" && renderRelatoriosEstoque()}
    </main>
  );

  function renderProdutos() {
    return (
      <section className="workspace">
        <form className="entity-form" onSubmit={enviarProduto}>
          <div className="form-header">
            <h2>{produtoForm.codigo > 0 ? "Editar produto" : "Novo produto"}</h2>
            {produtoForm.codigo > 0 && (
              <button className="text-button" type="button" onClick={() => setProdutoForm(produtoInicial)}>
                Cancelar edicao
              </button>
            )}
          </div>

          <label>
            Nome
            <input required minLength={3} value={produtoForm.nome} onChange={(event) => atualizarProdutoCampo("nome", event.target.value)} />
          </label>

          <label>
            Grupo alimentar
            <select required value={produtoForm.grupoAlimentarCodigo} onChange={(event) => atualizarProdutoCampo("grupoAlimentarCodigo", event.target.value)}>
              <option value="">Selecione</option>
              {grupos.map((grupo) => (
                <option key={grupo.codigo} value={grupo.codigo}>{grupo.nome}</option>
              ))}
            </select>
          </label>

          <label>
            Codigo de barras
            <input value={produtoForm.codigoBarras} onChange={(event) => atualizarProdutoCampo("codigoBarras", event.target.value)} />
          </label>

          <div className="form-grid">
            <label>
              Custo unidade
              <input required min="0.01" step="0.01" type="number" value={produtoForm.custoUnidade} onChange={(event) => atualizarProdutoCampo("custoUnidade", event.target.value)} />
            </label>
            <label>
              Valor energetico
              <input min="0" type="number" value={produtoForm.valorEnergetico} onChange={(event) => atualizarProdutoCampo("valorEnergetico", event.target.value)} />
            </label>
            <label>
              Estoque
              <input min="0" type="number" value={produtoForm.estoque} onChange={(event) => atualizarProdutoCampo("estoque", event.target.value)} />
            </label>
            <label>
              Estoque minimo
              <input min="0" type="number" value={produtoForm.estoqueMinimo} onChange={(event) => atualizarProdutoCampo("estoqueMinimo", event.target.value)} />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={salvandoProduto || grupos.length === 0}>
            {salvandoProduto ? "Salvando..." : produtoForm.codigo > 0 ? "Salvar alteracoes" : "Cadastrar produto"}
          </button>
        </form>

        <section className="entity-list">
          <div className="list-header">
            <div>
              <h2>Produtos cadastrados</h2>
              <p>{produtos.length} produto(s)</p>
            </div>
            <input aria-label="Filtrar produtos" placeholder="Filtrar por nome, codigo ou grupo" value={filtroProduto} onChange={(event) => setFiltroProduto(event.target.value)} />
          </div>
          {renderTabelaProdutos()}
        </section>
      </section>
    );
  }

  function renderGrupos() {
    return (
      <section className="workspace">
        <form className="entity-form" onSubmit={enviarGrupo}>
          <div className="form-header">
            <h2>{grupoForm.codigo > 0 ? "Editar grupo" : "Novo grupo"}</h2>
            {grupoForm.codigo > 0 && (
              <button className="text-button" type="button" onClick={() => setGrupoForm(grupoInicial)}>
                Cancelar edicao
              </button>
            )}
          </div>

          <label>
            Nome
            <input required minLength={3} value={grupoForm.nome} onChange={(event) => atualizarGrupoCampo("nome", event.target.value)} />
          </label>

          <button className="primary-button" type="submit" disabled={salvandoGrupo}>
            {salvandoGrupo ? "Salvando..." : grupoForm.codigo > 0 ? "Salvar alteracoes" : "Cadastrar grupo"}
          </button>
        </form>

        <section className="entity-list">
          <div className="list-header">
            <div>
              <h2>Grupos cadastrados</h2>
              <p>{grupos.length} grupo(s)</p>
            </div>
            <input aria-label="Filtrar grupos alimentares" placeholder="Filtrar por nome" value={filtroGrupo} onChange={(event) => setFiltroGrupo(event.target.value)} />
          </div>
          {renderTabelaGrupos()}
        </section>
      </section>
    );
  }

  function renderBairros() {
    return (
      <section className="workspace">
        <form className="entity-form" onSubmit={enviarBairro}>
          <div className="form-header">
            <h2>{bairroForm.codigo > 0 ? "Editar bairro" : "Novo bairro"}</h2>
            {bairroForm.codigo > 0 && (
              <button className="text-button" type="button" onClick={() => setBairroForm(bairroInicial)}>
                Cancelar edicao
              </button>
            )}
          </div>

          <label>
            Nome
            <input required minLength={3} value={bairroForm.nome} onChange={(event) => atualizarBairroCampo("nome", event.target.value)} />
          </label>

          <label>
            Custo de entrega
            <input required min="0" step="0.01" type="number" value={bairroForm.custoEntrega} onChange={(event) => atualizarBairroCampo("custoEntrega", event.target.value)} />
          </label>

          <button className="primary-button" type="submit" disabled={salvandoBairro}>
            {salvandoBairro ? "Salvando..." : bairroForm.codigo > 0 ? "Salvar alteracoes" : "Cadastrar bairro"}
          </button>
        </form>

        <section className="entity-list">
          <div className="list-header">
            <div>
              <h2>Bairros cadastrados</h2>
              <p>{bairros.length} bairro(s)</p>
            </div>
            <input aria-label="Filtrar bairros" placeholder="Filtrar por nome" value={filtroBairro} onChange={(event) => setFiltroBairro(event.target.value)} />
          </div>
          {renderTabelaBairros()}
        </section>
      </section>
    );
  }

  function renderClientes() {
    return (
      <section className="workspace">
        <form className="entity-form" onSubmit={enviarCliente}>
          <div className="form-header">
            <h2>{clienteForm.codigo > 0 ? "Editar cliente" : "Novo cliente"}</h2>
            {clienteForm.codigo > 0 && (
              <button className="text-button" type="button" onClick={() => setClienteForm(clienteInicial)}>
                Cancelar edicao
              </button>
            )}
          </div>

          <label>
            Nome
            <input required minLength={3} value={clienteForm.nome} onChange={(event) => atualizarClienteCampo("nome", event.target.value)} />
          </label>

          <div className="form-grid">
            <label>
              CPF
              <input required value={clienteForm.CPF} onChange={(event) => atualizarClienteCampo("CPF", event.target.value)} />
            </label>
            <label>
              RG
              <input required value={clienteForm.RG} onChange={(event) => atualizarClienteCampo("RG", event.target.value)} />
            </label>
          </div>

          <label>
            Telefone
            <input required value={clienteForm.telefone} onChange={(event) => atualizarClienteCampo("telefone", event.target.value)} />
          </label>

          <div className="input-action">
            <label>
              CEP
              <input value={clienteForm.cep} onChange={(event) => atualizarClienteCampo("cep", event.target.value)} />
            </label>
            <button className="secondary-button" type="button" disabled={buscandoCep || !clienteForm.cep} onClick={buscarCepCliente}>
              {buscandoCep ? "Buscando..." : "Buscar CEP"}
            </button>
          </div>

          <label>
            Logradouro
            <input required value={clienteForm.logradouro} onChange={(event) => atualizarClienteCampo("logradouro", event.target.value)} />
          </label>

          <div className="form-grid">
            <label>
              Numero
              <input required value={clienteForm.numero} onChange={(event) => atualizarClienteCampo("numero", event.target.value)} />
            </label>
            <label>
              Bairro
              <select required value={clienteForm.bairroCodigo} onChange={(event) => atualizarClienteCampo("bairroCodigo", event.target.value)}>
                <option value="">Selecione</option>
                {bairros.map((bairro) => (
                  <option key={bairro.codigo} value={bairro.codigo}>{bairro.nome}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Ponto de referencia
            <input value={clienteForm.pontoReferencia} onChange={(event) => atualizarClienteCampo("pontoReferencia", event.target.value)} />
          </label>

          <button className="primary-button" type="submit" disabled={salvandoCliente || bairros.length === 0}>
            {salvandoCliente ? "Salvando..." : clienteForm.codigo > 0 ? "Salvar alteracoes" : "Cadastrar cliente"}
          </button>
        </form>

        <section className="entity-list">
          <div className="list-header">
            <div>
              <h2>Clientes cadastrados</h2>
              <p>{clientes.length} cliente(s)</p>
            </div>
            <input aria-label="Filtrar clientes" placeholder="Filtrar por nome, CPF, telefone ou bairro" value={filtroCliente} onChange={(event) => setFiltroCliente(event.target.value)} />
          </div>
          {renderTabelaClientes()}
        </section>
      </section>
    );
  }

  function renderRegistroEstoque() {
    return (
      <section className="workspace">
        <form className="entity-form" onSubmit={enviarRegistro}>
          <div className="form-header">
            <h2>{registroForm.codigo > 0 ? "Editar registro" : "Novo registro"}</h2>
            {registroForm.codigo > 0 && (
              <button className="text-button" type="button" onClick={() => setRegistroForm(registroInicial)}>
                Cancelar edicao
              </button>
            )}
          </div>

          <label>
            Produto
            <select required value={registroForm.produtoCodigo} onChange={(event) => atualizarRegistroCampo("produtoCodigo", event.target.value)}>
              <option value="">Selecione</option>
              {produtos.map((produto) => (
                <option key={produto.codigo} value={produto.codigo}>{produto.nome}</option>
              ))}
            </select>
          </label>

          <label>
            Movimento
            <select value={registroForm.movimento} onChange={(event) => atualizarRegistroCampo("movimento", event.target.value)}>
              {tiposMovimento.map((tipo) => (
                <option key={tipo} value={tipo}>{formatarMovimento(tipo)}</option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <label>
              Data
              <input required type="date" value={registroForm.data} onChange={(event) => atualizarRegistroCampo("data", event.target.value)} />
            </label>
            <label>
              Quantidade
              <input required min="1" type="number" value={registroForm.quantidade} onChange={(event) => atualizarRegistroCampo("quantidade", event.target.value)} />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={salvandoRegistro || produtos.length === 0}>
            {salvandoRegistro ? "Salvando..." : registroForm.codigo > 0 ? "Salvar alteracoes" : "Cadastrar registro"}
          </button>
        </form>

        <section className="entity-list">
          <div className="list-header list-header-stack">
            <div>
              <h2>Registros de estoque</h2>
              <p>Consulta por movimento e data opcional</p>
            </div>
            <form className="inline-filters" onSubmit={aplicarFiltroRegistro}>
              <select value={filtroRegistroMovimento} onChange={(event) => setFiltroRegistroMovimento(event.target.value as MovimentoEstoqueDTO)}>
                {tiposMovimento.map((tipo) => (
                  <option key={tipo} value={tipo}>{formatarMovimento(tipo)}</option>
                ))}
              </select>
              <input type="date" value={filtroRegistroData} onChange={(event) => setFiltroRegistroData(event.target.value)} />
              <button className="secondary-button" type="submit">Buscar</button>
            </form>
          </div>
          {renderTabelaRegistros(registros, true)}
        </section>
      </section>
    );
  }

  function renderMovimentacaoEstoque() {
    return (
      <section className="full-workspace">
        <form className="filter-bar" onSubmit={aplicarFiltroMovimentacao}>
          <label>
            Tipo de movimento
            <select value={filtroMovimentacao} onChange={(event) => setFiltroMovimentacao(event.target.value as MovimentoEstoqueDTO)}>
              {tiposMovimento.map((tipo) => (
                <option key={tipo} value={tipo}>{formatarMovimento(tipo)}</option>
              ))}
            </select>
          </label>
          <label>
            Data
            <input type="date" value={filtroMovimentacaoData} onChange={(event) => setFiltroMovimentacaoData(event.target.value)} />
          </label>
          <button className="primary-button" type="submit">Consultar movimentacao</button>
        </form>

        <section className="metrics-grid">
          <div className="metric-card">
            <span>Registros</span>
            <strong>{resumoMovimentacao.totalRegistros}</strong>
          </div>
          <div className="metric-card">
            <span>Quantidade movimentada</span>
            <strong>{resumoMovimentacao.totalQuantidade}</strong>
          </div>
          <div className="metric-card">
            <span>Custo estimado</span>
            <strong>{moeda.format(resumoMovimentacao.custoEstimado)}</strong>
          </div>
        </section>

        <section className="entity-list">
          <div className="list-header">
            <div>
              <h2>Movimentacoes de estoque</h2>
              <p>{formatarMovimento(filtroMovimentacao)}</p>
            </div>
          </div>
          {renderTabelaRegistros(registrosMovimentacao, false)}
        </section>
      </section>
    );
  }

  function renderRelatoriosEstoque() {
    const exigePeriodo = tipoRelatorio === "perdas" || tipoRelatorio === "saidas";

    return (
      <section className="full-workspace">
        <form className="filter-bar" onSubmit={gerarRelatorio}>
          <label>
            Relatorio
            <select value={tipoRelatorio} onChange={(event) => setTipoRelatorio(event.target.value as TipoRelatorio)}>
              <option value="saldo">Saldo de estoque</option>
              <option value="baixo">Estoque baixo</option>
              <option value="perdas">Perdas</option>
              <option value="saidas">Saidas</option>
            </select>
          </label>
          <label>
            Inicio
            <input type="date" disabled={!exigePeriodo} value={relatorioInicio} onChange={(event) => setRelatorioInicio(event.target.value)} />
          </label>
          <label>
            Fim
            <input type="date" disabled={!exigePeriodo} value={relatorioFim} onChange={(event) => setRelatorioFim(event.target.value)} />
          </label>
          <button className="primary-button" type="submit" disabled={loadingRelatorio}>
            {loadingRelatorio ? "Gerando..." : "Gerar relatorio"}
          </button>
        </form>

        <section className="entity-list">
          <div className="list-header">
            <div>
              <h2>Relatorio de estoque</h2>
              <p>{labelRelatorio()}</p>
            </div>
          </div>
          {renderTabelaRelatorio()}
        </section>
      </section>
    );
  }

  function renderTabelaProdutos() {
    if (loading) {
      return <div className="empty-state">Carregando produtos...</div>;
    }

    if (produtosFiltrados.length === 0) {
      return <div className="empty-state">Nenhum produto encontrado.</div>;
    }

    return (
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
                <td>{moeda.format(produto.custoUnidade)}</td>
                <td>
                  <span className={produto.estoque <= produto.estoqueMinimo ? "stock-low" : ""}>{produto.estoque}</span>
                  <small> min. {produto.estoqueMinimo}</small>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => editarProduto(produto)}>Editar</button>
                    <button type="button" className="danger-button" onClick={() => removerProduto(produto)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderTabelaGrupos() {
    if (loading) {
      return <div className="empty-state">Carregando grupos...</div>;
    }

    if (gruposFiltrados.length === 0) {
      return <div className="empty-state">Nenhum grupo alimentar encontrado.</div>;
    }

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Grupo alimentar</th>
              <th>Produtos vinculados</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {gruposFiltrados.map((grupo) => (
              <tr key={grupo.codigo}>
                <td>{grupo.codigo}</td>
                <td><strong>{grupo.nome}</strong></td>
                <td>{quantidadeProdutosPorGrupo(grupo.codigo)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => editarGrupo(grupo)}>Editar</button>
                    <button type="button" className="danger-button" onClick={() => removerGrupo(grupo)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderTabelaBairros() {
    if (loading) {
      return <div className="empty-state">Carregando bairros...</div>;
    }

    if (bairrosFiltrados.length === 0) {
      return <div className="empty-state">Nenhum bairro encontrado.</div>;
    }

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Bairro</th>
              <th>Custo entrega</th>
              <th>Clientes vinculados</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {bairrosFiltrados.map((bairro) => (
              <tr key={bairro.codigo}>
                <td>{bairro.codigo}</td>
                <td><strong>{bairro.nome}</strong></td>
                <td>{moeda.format(bairro.custoEntrega)}</td>
                <td>{quantidadeClientesPorBairro(bairro.codigo)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => editarBairro(bairro)}>Editar</button>
                    <button type="button" className="danger-button" onClick={() => removerBairro(bairro)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderTabelaClientes() {
    if (loading) {
      return <div className="empty-state">Carregando clientes...</div>;
    }

    if (clientesFiltrados.length === 0) {
      return <div className="empty-state">Nenhum cliente encontrado.</div>;
    }

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Cliente</th>
              <th>Contato</th>
              <th>Endereco</th>
              <th>Bairro</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.codigo}>
                <td>{cliente.codigo}</td>
                <td>
                  <strong>{cliente.nome}</strong>
                  <span>CPF {cliente.CPF || "-"}</span>
                </td>
                <td>
                  <span>{cliente.telefone || "-"}</span>
                  <small>RG {cliente.RG || "-"}</small>
                </td>
                <td>
                  <strong>{cliente.logradouro || "-"}</strong>
                  <span>{cliente.numero || "S/N"} - CEP {cliente.cep || "-"}</span>
                </td>
                <td>
                  <strong>{cliente.bairro?.nome ?? "-"}</strong>
                  <span>{cliente.bairro ? moeda.format(cliente.bairro.custoEntrega) : "-"}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => editarCliente(cliente)}>Editar</button>
                    <button type="button" className="danger-button" onClick={() => removerCliente(cliente)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderTabelaRegistros(lista: RegistroEstoqueDTO[], permitirAcoes: boolean) {
    if (loadingRegistros) {
      return <div className="empty-state">Carregando registros...</div>;
    }

    if (lista.length === 0) {
      return <div className="empty-state">Nenhum registro encontrado.</div>;
    }

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Produto</th>
              <th>Movimento</th>
              <th>Data</th>
              <th>Quantidade</th>
              <th>Custo estimado</th>
              {permitirAcoes && <th>Acoes</th>}
            </tr>
          </thead>
          <tbody>
            {lista.map((registro) => (
              <tr key={registro.codigo}>
                <td>{registro.codigo}</td>
                <td>
                  <strong>{registro.produto?.nome ?? "-"}</strong>
                  <span>{registro.produto?.grupoAlimentar?.nome ?? "-"}</span>
                </td>
                <td><span className="status-badge">{formatarMovimento(registro.movimento)}</span></td>
                <td>{registro.data}</td>
                <td>{registro.quantidade}</td>
                <td>{moeda.format(registro.quantidade * (registro.produto?.custoUnidade ?? 0))}</td>
                {permitirAcoes && (
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => editarRegistro(registro)}>Editar</button>
                      <button type="button" className="danger-button" onClick={() => removerRegistro(registro)}>Excluir</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function labelRelatorio() {
    if (tipoRelatorio === "saldo") {
      return "Saldo atual por produto";
    }
    if (tipoRelatorio === "baixo") {
      return "Produtos abaixo do estoque minimo";
    }
    if (tipoRelatorio === "perdas") {
      return `Perdas de ${relatorioInicio} ate ${relatorioFim}`;
    }
    return `Saidas de ${relatorioInicio} ate ${relatorioFim}`;
  }

  function renderTabelaRelatorio() {
    if (loadingRelatorio) {
      return <div className="empty-state">Gerando relatorio...</div>;
    }

    if (tipoRelatorio === "saldo") {
      if (saldoRelatorio.length === 0) {
        return <div className="empty-state">Clique em gerar relatorio para consultar o saldo.</div>;
      }

      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Custo unidade</th>
                <th>Total</th>
                <th>Situacao</th>
              </tr>
            </thead>
            <tbody>
              {saldoRelatorio.map((item) => (
                <tr key={item.codigoProduto}>
                  <td>{item.codigoProduto}</td>
                  <td><strong>{item.nomeProduto}</strong></td>
                  <td>{item.estoqueAtual}<small> min. {item.estoqueMinimo}</small></td>
                  <td>{moeda.format(item.custoUnidade)}</td>
                  <td>{moeda.format(item.valorTotalEstoque)}</td>
                  <td><span className="status-badge">{item.situacao}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (tipoRelatorio === "baixo") {
      if (baixoRelatorio.length === 0) {
        return <div className="empty-state">Clique em gerar relatorio para consultar estoque baixo.</div>;
      }

      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Produto</th>
                <th>Atual</th>
                <th>Minimo</th>
                <th>Reposicao</th>
              </tr>
            </thead>
            <tbody>
              {baixoRelatorio.map((item) => (
                <tr key={item.codigoProduto}>
                  <td>{item.codigoProduto}</td>
                  <td><strong>{item.nomeProduto}</strong></td>
                  <td>{item.estoqueAtual}</td>
                  <td>{item.estoqueMinimo}</td>
                  <td><span className="stock-low">{item.quantidadeParaReposicao}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (tipoRelatorio === "perdas") {
      if (perdasRelatorio.length === 0) {
        return <div className="empty-state">Clique em gerar relatorio para consultar perdas.</div>;
      }

      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Produto</th>
                <th>Movimento</th>
                <th>Quantidade perdida</th>
                <th>Custo estimado</th>
              </tr>
            </thead>
            <tbody>
              {perdasRelatorio.map((item) => (
                <tr key={`${item.codigoProduto}-${item.movimento}`}>
                  <td>{item.codigoProduto}</td>
                  <td><strong>{item.nomeProduto}</strong></td>
                  <td>{formatarMovimento(item.movimento)}</td>
                  <td>{item.quantidadePerdida}</td>
                  <td>{moeda.format(item.custoEstimado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (saidasRelatorio.length === 0) {
      return <div className="empty-state">Clique em gerar relatorio para consultar saidas.</div>;
    }

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Produto</th>
              <th>Movimento</th>
              <th>Quantidade</th>
              <th>Custo estimado</th>
            </tr>
          </thead>
          <tbody>
            {saidasRelatorio.map((item) => (
              <tr key={`${item.codigoProduto}-${item.movimento}`}>
                <td>{item.codigoProduto}</td>
                <td><strong>{item.nomeProduto}</strong></td>
                <td>{formatarMovimento(item.movimento)}</td>
                <td>{item.quantidade}</td>
                <td>{moeda.format(item.custoEstimado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
