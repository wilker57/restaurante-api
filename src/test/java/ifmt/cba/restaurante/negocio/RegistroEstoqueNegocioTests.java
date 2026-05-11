package ifmt.cba.restaurante.negocio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import ifmt.cba.restaurante.dto.GrupoAlimentarDTO;
import ifmt.cba.restaurante.dto.MovimentoEstoqueDTO;
import ifmt.cba.restaurante.dto.ProdutoDTO;
import ifmt.cba.restaurante.dto.RegistroEstoqueDTO;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.repository.ProdutoRepository;
import ifmt.cba.restaurante.repository.RegistroEstoqueRepository;

@SpringBootTest
@ActiveProfiles("test")
class RegistroEstoqueNegocioTests {

    @Autowired
    private GrupoAlimentarNegocio grupoAlimentarNegocio;

    @Autowired
    private ProdutoNegocio produtoNegocio;

    @Autowired
    private RegistroEstoqueNegocio registroEstoqueNegocio;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private RegistroEstoqueRepository registroEstoqueRepository;

    @Test
    void deveExcluirRegistroDeCompraEReverterSaldoDoProduto() throws Exception {
        ProdutoDTO produto = criarProduto("Produto Exclusao Estoque");
        RegistroEstoqueDTO registro = criarRegistro(produto, MovimentoEstoqueDTO.COMPRA, 5);

        RegistroEstoqueDTO inserido = registroEstoqueNegocio.inserir(registro);
        assertThat(estoqueAtual(produto.getCodigo())).isEqualTo(15);

        RegistroEstoqueDTO excluido = registroEstoqueNegocio.excluir(inserido.getCodigo());

        assertThat(excluido.getCodigo()).isEqualTo(inserido.getCodigo());
        assertThat(estoqueAtual(produto.getCodigo())).isEqualTo(10);
        assertThat(registroEstoqueRepository.findById(inserido.getCodigo())).isEmpty();
    }

    @Test
    void deveBloquearMovimentoQueDeixaEstoqueNegativo() throws Exception {
        ProdutoDTO produto = criarProduto("Produto Saida Bloqueada");
        RegistroEstoqueDTO registro = criarRegistro(produto, MovimentoEstoqueDTO.PRODUCAO, 11);

        assertThatThrownBy(() -> registroEstoqueNegocio.inserir(registro))
                .isInstanceOf(NotValidDataException.class)
                .hasMessageContaining("estoque negativo");

        assertThat(estoqueAtual(produto.getCodigo())).isEqualTo(10);
    }

    private ProdutoDTO criarProduto(String nome) throws Exception {
        GrupoAlimentarDTO grupo = grupoAlimentarNegocio.pesquisaPorNome("Carboidratos");
        ProdutoDTO produto = new ProdutoDTO();
        produto.setNome(nome + " " + System.nanoTime());
        produto.setCustoUnidade(1.0f);
        produto.setValorEnergetico(1);
        produto.setEstoque(10);
        produto.setEstoqueMinimo(1);
        produto.setGrupoAlimentar(grupo);
        return produtoNegocio.inserir(produto);
    }

    private RegistroEstoqueDTO criarRegistro(ProdutoDTO produto, MovimentoEstoqueDTO movimento, int quantidade) {
        RegistroEstoqueDTO registro = new RegistroEstoqueDTO();
        registro.setProduto(produto);
        registro.setMovimento(movimento);
        registro.setData(LocalDate.now());
        registro.setQuantidade(quantidade);
        return registro;
    }

    private int estoqueAtual(int codigoProduto) {
        return produtoRepository.findById(codigoProduto).orElseThrow().getEstoque();
    }
}
