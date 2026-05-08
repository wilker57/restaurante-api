package ifmt.cba.restaurante.integration.openfoodfacts;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import ifmt.cba.restaurante.dto.ProdutoOpenFoodFactsDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;

@Service
public class OpenFoodFactsClient {

    private final RestClient restClient;

    public OpenFoodFactsClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://world.openfoodfacts.org")
                .defaultHeader(HttpHeaders.USER_AGENT, "restaurante-spring/1.0")
                .build();
    }

    public ProdutoOpenFoodFactsDTO consultarProduto(String codigoBarras)
            throws NotFoundException, NotValidDataException {
        String codigoNormalizado = this.normalizarCodigoBarras(codigoBarras);

        try {
            OpenFoodFactsResponse response = restClient.get()
                    .uri("/api/v2/product/{codigo}.json?fields=product_name,brands,nutriments",
                            codigoNormalizado)
                    .retrieve()
                    .body(OpenFoodFactsResponse.class);

            if (response == null || response.getStatus() == null || response.getStatus() == 0
                    || response.getProduct() == null) {
                throw new NotFoundException("Produto nao encontrado no Open Food Facts");
            }

            Integer valorEnergetico = null;
            if (response.getProduct().getNutriments() != null
                    && response.getProduct().getNutriments().getEnergyKcal100g() != null) {
                valorEnergetico = Math.round(response.getProduct().getNutriments().getEnergyKcal100g());
            }

            return new ProdutoOpenFoodFactsDTO(
                    codigoNormalizado,
                    response.getProduct().getProductName(),
                    response.getProduct().getBrands(),
                    valorEnergetico);
        } catch (NotFoundException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new NotValidDataException("Erro ao consultar Open Food Facts - " + ex.getMessage());
        }
    }

    private String normalizarCodigoBarras(String codigoBarras) throws NotValidDataException {
        if (codigoBarras == null) {
            throw new NotValidDataException("Codigo de barras invalido");
        }

        String codigoNormalizado = codigoBarras.replaceAll("\\D", "");
        if (codigoNormalizado.length() < 8 || codigoNormalizado.length() > 14) {
            throw new NotValidDataException("Codigo de barras deve conter entre 8 e 14 digitos");
        }

        return codigoNormalizado;
    }
}
