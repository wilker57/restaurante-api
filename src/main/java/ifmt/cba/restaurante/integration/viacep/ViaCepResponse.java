package ifmt.cba.restaurante.integration.viacep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ViaCepResponse {

    private String cep;
    private String logradouro;
    private String complemento;
    private String bairro;
    private String localidade;
    private String uf;
    private Boolean erro;
}
