package ifmt.cba.restaurante.controller;

import ifmt.cba.restaurante.dto.MovimentoEstoqueDTO;
import ifmt.cba.restaurante.dto.RegistroEstoqueDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.negocio.RegistroEstoqueNegocio;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/registro")
public class RegistroEstoqueController {

    private final RegistroEstoqueNegocio registroEstoqueNegocio;

    public RegistroEstoqueController(RegistroEstoqueNegocio registroEstoqueNegocio) {
        this.registroEstoqueNegocio = registroEstoqueNegocio;
    }

    @GetMapping(value = "/codigo/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public RegistroEstoqueDTO buscarPorCodigo(@PathVariable("codigo") int codigo) throws NotFoundException {
        return registroEstoqueNegocio.pesquisaCodigo(codigo);
    }

    @GetMapping(value = "/movimento/{movimento}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<RegistroEstoqueDTO> buscarPorMovimento(@PathVariable("movimento") MovimentoEstoqueDTO movimento)
            throws NotFoundException {
        return registroEstoqueNegocio.buscarPorMovimento(movimento);
    }

    @GetMapping(value = "/movimento/{movimento}/data/{data}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<RegistroEstoqueDTO> buscarPorMovimentoEData(
            @PathVariable("movimento") MovimentoEstoqueDTO movimento,
            @PathVariable("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data)
            throws NotFoundException {
        return registroEstoqueNegocio.buscarPorMovimentoEData(movimento, data);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public RegistroEstoqueDTO inserirRegistro(@RequestBody RegistroEstoqueDTO registroEstoqueDTO)
            throws NotFoundException, NotValidDataException {
        return registroEstoqueNegocio.inserir(registroEstoqueDTO);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public RegistroEstoqueDTO alterarRegistro(@RequestBody RegistroEstoqueDTO registroEstoqueDTO)
            throws NotFoundException, NotValidDataException {
        return registroEstoqueNegocio.alterar(registroEstoqueDTO);
    }

    @DeleteMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public RegistroEstoqueDTO excluirRegistro(@RequestBody RegistroEstoqueDTO registroEstoqueDTO)
            throws NotFoundException, NotValidDataException {
        return registroEstoqueNegocio.excluir(registroEstoqueDTO);
    }

    @DeleteMapping(value = "/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public RegistroEstoqueDTO excluirRegistroPorCodigo(@PathVariable("codigo") int codigo)
            throws NotFoundException, NotValidDataException {
        return registroEstoqueNegocio.excluir(codigo);
    }
}
