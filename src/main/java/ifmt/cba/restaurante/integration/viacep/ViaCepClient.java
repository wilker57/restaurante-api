package ifmt.cba.restaurante.integration.viacep;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import ifmt.cba.restaurante.dto.EnderecoCepDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;

@Service
public class ViaCepClient {

    private final RestClient restClient;

    public ViaCepClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://viacep.com.br/ws")
                .build();
    }

    public EnderecoCepDTO consultarEndereco(String cep) throws NotFoundException, NotValidDataException {
        String cepNormalizado = this.normalizarCep(cep);

        try {
            ViaCepResponse response = restClient.get()
                    .uri("/{cep}/json/", cepNormalizado)
                    .retrieve()
                    .body(ViaCepResponse.class);

            if (response == null || Boolean.TRUE.equals(response.getErro())) {
                throw new NotFoundException("CEP nao encontrado");
            }

            return new EnderecoCepDTO(
                    response.getCep(),
                    response.getLogradouro(),
                    response.getComplemento(),
                    response.getBairro(),
                    response.getLocalidade(),
                    response.getUf());
        } catch (NotFoundException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new NotValidDataException("Erro ao consultar CEP - " + ex.getMessage());
        }
    }

    private String normalizarCep(String cep) throws NotValidDataException {
        if (cep == null) {
            throw new NotValidDataException("CEP invalido");
        }

        String cepNormalizado = cep.replaceAll("\\D", "");
        if (cepNormalizado.length() != 8) {
            throw new NotValidDataException("CEP deve conter 8 digitos");
        }

        return cepNormalizado;
    }
}
