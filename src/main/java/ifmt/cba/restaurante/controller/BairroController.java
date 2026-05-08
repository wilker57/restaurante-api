package ifmt.cba.restaurante.controller;

import ifmt.cba.restaurante.dto.BairroDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.negocio.BairroNegocio;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bairro")
public class BairroController {

    private final BairroNegocio bairroNegocio;

    public BairroController(BairroNegocio bairroNegocio) {
        this.bairroNegocio = bairroNegocio;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<BairroDTO> buscarTodos() throws NotFoundException, NotValidDataException {
        return bairroNegocio.pesquisaTodos();
    }

    @GetMapping(value = "/codigo/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public BairroDTO buscarPorID(@PathVariable("codigo") int codigo) throws NotFoundException, NotValidDataException {
        return bairroNegocio.pesquisaCodigo(codigo);
    }

    @GetMapping(value = "/nome/{nome}", produces = MediaType.APPLICATION_JSON_VALUE)
    public BairroDTO buscarPorNome(@PathVariable("nome") String nome) throws NotFoundException, NotValidDataException {
        return bairroNegocio.pesquisaPorNome(nome);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public BairroDTO inserirBairro(@RequestBody BairroDTO bairroDTO) throws NotFoundException, NotValidDataException {
        return bairroNegocio.inserir(bairroDTO);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public BairroDTO alterarBairro(@RequestBody BairroDTO bairroDTO) throws NotFoundException, NotValidDataException {
        return bairroNegocio.alterar(bairroDTO);
    }

    @DeleteMapping(value = "/{codigo}")
    public ResponseEntity<Void> excluirBairro(@PathVariable("codigo") int codigo) throws NotFoundException, NotValidDataException {
        bairroNegocio.excluir(codigo);
        return ResponseEntity.noContent().build();
    }
}
