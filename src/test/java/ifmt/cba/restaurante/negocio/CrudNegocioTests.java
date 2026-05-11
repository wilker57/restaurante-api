package ifmt.cba.restaurante.negocio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import ifmt.cba.restaurante.dto.BairroDTO;
import ifmt.cba.restaurante.dto.ClienteDTO;
import ifmt.cba.restaurante.dto.GrupoAlimentarDTO;
import ifmt.cba.restaurante.dto.ProdutoDTO;
import ifmt.cba.restaurante.exception.NotFoundException;

@SpringBootTest
@ActiveProfiles("test")
class CrudNegocioTests {

    @Autowired
    private BairroNegocio bairroNegocio;

    @Autowired
    private ClienteNegocio clienteNegocio;

    @Autowired
    private GrupoAlimentarNegocio grupoAlimentarNegocio;

    @Autowired
    private ProdutoNegocio produtoNegocio;

    @Test
    void deveExecutarCrudDeBairro() throws Exception {
        BairroDTO bairro = new BairroDTO();
        bairro.setNome(nomeUnico("Bairro CRUD"));
        bairro.setCustoEntrega(12.5f);

        BairroDTO inserido = bairroNegocio.inserir(bairro);
        assertThat(inserido.getCodigo()).isPositive();
        assertThat(bairroNegocio.pesquisaCodigo(inserido.getCodigo()).getNome()).isEqualTo(inserido.getNome());

        inserido.setNome(nomeUnico("Bairro Alterado"));
        inserido.setCustoEntrega(15.0f);
        BairroDTO alterado = bairroNegocio.alterar(inserido);
        assertThat(alterado.getNome()).isEqualTo(inserido.getNome());
        assertThat(alterado.getCustoEntrega()).isEqualTo(15.0f);

        bairroNegocio.excluir(alterado.getCodigo());
        assertThatThrownBy(() -> bairroNegocio.pesquisaCodigo(alterado.getCodigo()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deveExecutarCrudDeGrupoAlimentar() throws Exception {
        GrupoAlimentarDTO grupo = new GrupoAlimentarDTO();
        grupo.setNome(nomeUnico("Grupo CRUD"));

        GrupoAlimentarDTO inserido = grupoAlimentarNegocio.inserir(grupo);
        assertThat(inserido.getCodigo()).isPositive();
        assertThat(grupoAlimentarNegocio.pesquisaCodigo(inserido.getCodigo()).getNome()).isEqualTo(inserido.getNome());

        inserido.setNome(nomeUnico("Grupo Alterado"));
        GrupoAlimentarDTO alterado = grupoAlimentarNegocio.alterar(inserido);
        assertThat(alterado.getNome()).isEqualTo(inserido.getNome());

        grupoAlimentarNegocio.excluir(alterado.getCodigo());
        assertThatThrownBy(() -> grupoAlimentarNegocio.pesquisaCodigo(alterado.getCodigo()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deveExecutarCrudDeProduto() throws Exception {
        ProdutoDTO produto = criarProduto(nomeUnico("Produto CRUD"));

        ProdutoDTO inserido = produtoNegocio.inserir(produto);
        assertThat(inserido.getCodigo()).isPositive();
        assertThat(produtoNegocio.pesquisaCodigo(inserido.getCodigo()).getNome()).isEqualTo(inserido.getNome());

        inserido.setNome(nomeUnico("Produto Alterado"));
        inserido.setCustoUnidade(4.5f);
        ProdutoDTO alterado = produtoNegocio.alterar(inserido);
        assertThat(alterado.getNome()).isEqualTo(inserido.getNome());
        assertThat(alterado.getCustoUnidade()).isEqualTo(4.5f);

        produtoNegocio.excluir(alterado.getCodigo());
        assertThatThrownBy(() -> produtoNegocio.pesquisaCodigo(alterado.getCodigo()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deveExecutarCrudDeCliente() throws Exception {
        BairroDTO bairro = bairroNegocio.pesquisaPorNome("Centro");
        ClienteDTO cliente = new ClienteDTO();
        cliente.setNome(nomeUnico("Cliente CRUD"));
        cliente.setCPF(cpfUnico());
        cliente.setRG("RG-" + System.nanoTime());
        cliente.setTelefone("65999990000");
        cliente.setLogradouro("Rua Teste");
        cliente.setNumero("123");
        cliente.setPontoReferencia("Referencia teste");
        cliente.setBairro(bairro);

        ClienteDTO inserido = clienteNegocio.inserir(cliente);
        assertThat(inserido.getCodigo()).isPositive();
        assertThat(clienteNegocio.pesquisaCodigo(inserido.getCodigo()).getNome()).isEqualTo(inserido.getNome());

        inserido.setNome(nomeUnico("Cliente Alterado"));
        inserido.setTelefone("65888880000");
        ClienteDTO alterado = clienteNegocio.alterar(inserido);
        assertThat(alterado.getNome()).isEqualTo(inserido.getNome());
        assertThat(alterado.getTelefone()).isEqualTo("65888880000");

        clienteNegocio.excluir(alterado.getCodigo());
        assertThatThrownBy(() -> clienteNegocio.pesquisaCodigo(alterado.getCodigo()))
                .isInstanceOf(NotFoundException.class);
    }

    private ProdutoDTO criarProduto(String nome) throws Exception {
        ProdutoDTO produto = new ProdutoDTO();
        produto.setNome(nome);
        produto.setCustoUnidade(3.0f);
        produto.setValorEnergetico(10);
        produto.setEstoque(20);
        produto.setEstoqueMinimo(5);
        produto.setGrupoAlimentar(grupoAlimentarNegocio.pesquisaPorNome("Carboidratos"));
        return produto;
    }

    private String nomeUnico(String prefixo) {
        return prefixo + " " + System.nanoTime();
    }

    private String cpfUnico() {
        return String.valueOf(System.nanoTime()).substring(0, 11);
    }
}
