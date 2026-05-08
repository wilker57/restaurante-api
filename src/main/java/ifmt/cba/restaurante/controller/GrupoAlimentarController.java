package ifmt.cba.restaurante.controller;


import ifmt.cba.restaurante.dto.GrupoAlimentarDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.negocio.GrupoAlimentarNegocio;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grupoalimentar")
public class GrupoAlimentarController {

    private final GrupoAlimentarNegocio grupoAlimentarNegocio;

    public GrupoAlimentarController(GrupoAlimentarNegocio grupoAlimentarNegocio){
        this.grupoAlimentarNegocio = grupoAlimentarNegocio;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<GrupoAlimentarDTO> buscarTodos() throws NotFoundException, NotValidDataException{
        return grupoAlimentarNegocio.pesquisaTodos();
    }

    @GetMapping(value = "/codigo/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public GrupoAlimentarDTO buscarPorID(@PathVariable("codigo") int codigo) throws NotFoundException, NotValidDataException{
        return grupoAlimentarNegocio.pesquisaCodigo(codigo);
    }

    @GetMapping(value = "/nome/{nome}", produces = MediaType.APPLICATION_JSON_VALUE)
    public GrupoAlimentarDTO buscarPorNome(@PathVariable("nome") String nome) throws NotFoundException, NotValidDataException{
        return grupoAlimentarNegocio.pesquisaPorNome(nome);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public GrupoAlimentarDTO inserirGrupo(@RequestBody GrupoAlimentarDTO grupoAlimentarDTO) throws NotFoundException, NotValidDataException{
        return grupoAlimentarNegocio.inserir(grupoAlimentarDTO);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public GrupoAlimentarDTO alterarGrupo(@RequestBody GrupoAlimentarDTO grupoAlimentarDTO) throws NotFoundException, NotValidDataException{
        return grupoAlimentarNegocio.alterar(grupoAlimentarDTO);
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<?> excluirGrupo(@PathVariable("codigo")int codigo) throws NotFoundException, NotValidDataException{
        grupoAlimentarNegocio.excluir(codigo);
        return ResponseEntity.noContent().build();
    }
}
