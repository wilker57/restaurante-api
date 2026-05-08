package ifmt.cba.restaurante.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SaldoEstoqueRelatorioDTO {

    private int codigoProduto;
    private String nomeProduto;
    private int estoqueAtual;
    private int estoqueMinimo;
    private float custoUnidade;
    private float valorTotalEstoque;
    private String situacao;
}
