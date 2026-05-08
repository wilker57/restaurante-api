package ifmt.cba.restaurante.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SaidaEstoqueRelatorioDTO {

    private int codigoProduto;
    private String nomeProduto;
    private String movimento;
    private int quantidade;
    private float custoEstimado;
}
