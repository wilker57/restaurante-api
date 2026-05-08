package ifmt.cba.restaurante.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ifmt.cba.restaurante.dto.EstoqueBaixoRelatorioDTO;
import ifmt.cba.restaurante.dto.PerdaEstoqueRelatorioDTO;
import ifmt.cba.restaurante.dto.SaidaEstoqueRelatorioDTO;
import ifmt.cba.restaurante.dto.SaldoEstoqueRelatorioDTO;
import ifmt.cba.restaurante.negocio.RelatorioEstoqueNegocio;

@RestController
@RequestMapping("/relatorio/estoque")
public class RelatorioEstoqueController {

    private final RelatorioEstoqueNegocio relatorioEstoqueNegocio;

    public RelatorioEstoqueController(RelatorioEstoqueNegocio relatorioEstoqueNegocio) {
        this.relatorioEstoqueNegocio = relatorioEstoqueNegocio;
    }

    @GetMapping(value = "/baixo", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<EstoqueBaixoRelatorioDTO> estoqueBaixo() {
        return relatorioEstoqueNegocio.estoqueBaixo();
    }

    @GetMapping(value = "/saldo", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SaldoEstoqueRelatorioDTO> saldo() {
        return relatorioEstoqueNegocio.saldo();
    }

    @GetMapping(value = "/perdas", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<PerdaEstoqueRelatorioDTO> perdas(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return relatorioEstoqueNegocio.perdas(inicio, fim);
    }

    @GetMapping(value = "/saidas", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SaidaEstoqueRelatorioDTO> saidas(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return relatorioEstoqueNegocio.saidas(inicio, fim);
    }
}
