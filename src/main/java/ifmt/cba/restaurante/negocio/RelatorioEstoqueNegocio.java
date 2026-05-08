package ifmt.cba.restaurante.negocio;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ifmt.cba.restaurante.dto.EstoqueBaixoRelatorioDTO;
import ifmt.cba.restaurante.dto.MovimentoEstoqueDTO;
import ifmt.cba.restaurante.dto.PerdaEstoqueRelatorioDTO;
import ifmt.cba.restaurante.dto.SaidaEstoqueRelatorioDTO;
import ifmt.cba.restaurante.dto.SaldoEstoqueRelatorioDTO;
import ifmt.cba.restaurante.entity.Produto;
import ifmt.cba.restaurante.entity.RegistroEstoque;
import ifmt.cba.restaurante.repository.ProdutoRepository;
import ifmt.cba.restaurante.repository.RegistroEstoqueRepository;

@Service
public class RelatorioEstoqueNegocio {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private RegistroEstoqueRepository registroEstoqueRepository;

    public List<EstoqueBaixoRelatorioDTO> estoqueBaixo() {
        List<EstoqueBaixoRelatorioDTO> relatorio = new ArrayList<>();

        for (Produto produto : produtoRepository.findByEstoqueMenorEstoqueMinimo()) {
            relatorio.add(new EstoqueBaixoRelatorioDTO(
                    produto.getCodigo(),
                    produto.getNome(),
                    produto.getEstoque(),
                    produto.getEstoqueMinimo(),
                    produto.getEstoqueMinimo() - produto.getEstoque()));
        }

        return relatorio;
    }

    public List<SaldoEstoqueRelatorioDTO> saldo() {
        List<SaldoEstoqueRelatorioDTO> relatorio = new ArrayList<>();

        for (Produto produto : produtoRepository.findAll()) {
            relatorio.add(new SaldoEstoqueRelatorioDTO(
                    produto.getCodigo(),
                    produto.getNome(),
                    produto.getEstoque(),
                    produto.getEstoqueMinimo(),
                    produto.getCustoUnidade(),
                    produto.getEstoque() * produto.getCustoUnidade(),
                    this.definirSituacao(produto)));
        }

        return relatorio;
    }

    public List<PerdaEstoqueRelatorioDTO> perdas(LocalDate inicio, LocalDate fim) {
        Map<String, PerdaEstoqueRelatorioDTO> relatorio = new LinkedHashMap<>();
        List<RegistroEstoque> registros = registroEstoqueRepository.findByDataBetween(inicio, fim);

        for (RegistroEstoque registro : registros) {
            if (registro.getMovimento() == MovimentoEstoqueDTO.VENCIMENTO
                    || registro.getMovimento() == MovimentoEstoqueDTO.DANIFICADO) {
                String chave = registro.getProduto().getCodigo() + "-" + registro.getMovimento();
                PerdaEstoqueRelatorioDTO item = relatorio.get(chave);

                if (item == null) {
                    item = new PerdaEstoqueRelatorioDTO(
                            registro.getProduto().getCodigo(),
                            registro.getProduto().getNome(),
                            registro.getMovimento().name(),
                            0,
                            0);
                    relatorio.put(chave, item);
                }

                item.setQuantidadePerdida(item.getQuantidadePerdida() + registro.getQuantidade());
                item.setCustoEstimado(item.getCustoEstimado()
                        + (registro.getQuantidade() * registro.getProduto().getCustoUnidade()));
            }
        }

        return new ArrayList<>(relatorio.values());
    }

    public List<SaidaEstoqueRelatorioDTO> saidas(LocalDate inicio, LocalDate fim) {
        Map<String, SaidaEstoqueRelatorioDTO> relatorio = new LinkedHashMap<>();
        List<RegistroEstoque> registros = registroEstoqueRepository.findByDataBetween(inicio, fim);

        for (RegistroEstoque registro : registros) {
            if (registro.getMovimento() != MovimentoEstoqueDTO.COMPRA) {
                String chave = registro.getProduto().getCodigo() + "-" + registro.getMovimento();
                SaidaEstoqueRelatorioDTO item = relatorio.get(chave);

                if (item == null) {
                    item = new SaidaEstoqueRelatorioDTO(
                            registro.getProduto().getCodigo(),
                            registro.getProduto().getNome(),
                            registro.getMovimento().name(),
                            0,
                            0);
                    relatorio.put(chave, item);
                }

                item.setQuantidade(item.getQuantidade() + registro.getQuantidade());
                item.setCustoEstimado(item.getCustoEstimado()
                        + (registro.getQuantidade() * registro.getProduto().getCustoUnidade()));
            }
        }

        return new ArrayList<>(relatorio.values());
    }

    private String definirSituacao(Produto produto) {
        if (produto.getEstoque() == 0) {
            return "ZERADO";
        }
        if (produto.getEstoque() < produto.getEstoqueMinimo()) {
            return "BAIXO";
        }
        return "NORMAL";
    }
}
