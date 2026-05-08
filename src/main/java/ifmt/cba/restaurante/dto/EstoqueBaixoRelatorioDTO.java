package ifmt.cba.restaurante.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EstoqueBaixoRelatorioDTO {

    private int codigoProduto;
    private String nomeProduto;
    private int estoqueAtual;
    private int estoqueMinimo;
    private int quantidadeParaReposicao;
}
