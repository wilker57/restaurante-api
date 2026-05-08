package ifmt.cba.restaurante.integration.openfoodfacts;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OpenFoodFactsResponse {

    private String code;
    private Integer status;

    @JsonProperty("status_verbose")
    private String statusVerbose;

    private OpenFoodFactsProduct product;

    @Getter
    @Setter
    public static class OpenFoodFactsProduct {

        @JsonProperty("product_name")
        private String productName;

        private String brands;

        private OpenFoodFactsNutriments nutriments;
    }

    @Getter
    @Setter
    public static class OpenFoodFactsNutriments {

        @JsonProperty("energy-kcal_100g")
        private Float energyKcal100g;
    }
}
