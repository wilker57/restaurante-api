package ifmt.cba.restaurante.controller;

import ifmt.cba.restaurante.dto.ConsultaCodigoBarrasDTO;
import ifmt.cba.restaurante.dto.ProdutoDTO;
import ifmt.cba.restaurante.dto.ProdutoOpenFoodFactsDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.negocio.ProdutoNegocio;
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
@RequestMapping("/produto")
public class ProdutoController {

    private final ProdutoNegocio produtoNegocio;

    public ProdutoController(ProdutoNegocio produtoNegocio) {
        this.produtoNegocio = produtoNegocio;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ProdutoDTO> buscarTodos() throws NotFoundException, NotValidDataException {
        return produtoNegocio.pesquisaTodos();
    }

    @GetMapping(value = "/codigo/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ProdutoDTO buscarPorID(@PathVariable("codigo") int codigo) throws NotFoundException, NotValidDataException {
        return produtoNegocio.pesquisaCodigo(codigo);
    }

    @GetMapping(value = "/nome/{nome}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ProdutoDTO buscarPorNome(@PathVariable("nome") String nome) throws NotFoundException, NotValidDataException {
        return produtoNegocio.pesquisaPorNome(nome);
    }

    @GetMapping(value = "/estoqueminimo", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ProdutoDTO> buscarAbaixoEstoqueMinimo() throws NotFoundException, NotValidDataException {
        return produtoNegocio.pesquisaProdutoAbaixoEstoqueMinimo();
    }

    @PostMapping(value = "/codigobarras", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ProdutoOpenFoodFactsDTO buscarPorCodigoBarras(@RequestBody ConsultaCodigoBarrasDTO consultaCodigoBarrasDTO)
            throws NotFoundException, NotValidDataException {
        return produtoNegocio.pesquisarPorCodigoBarras(consultaCodigoBarrasDTO.getCodigoBarras());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ProdutoDTO inserirProduto(@RequestBody ProdutoDTO produtoDTO) throws NotFoundException, NotValidDataException {
        return produtoNegocio.inserir(produtoDTO);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ProdutoDTO alterarProduto(@RequestBody ProdutoDTO produtoDTO) throws NotFoundException, NotValidDataException {
        return produtoNegocio.alterar(produtoDTO);
    }

    @DeleteMapping(value = "/{codigo}")
    public ResponseEntity<Void> excluirProduto(@PathVariable("codigo") int codigo) throws NotFoundException, NotValidDataException {
        produtoNegocio.excluir(codigo);
        return ResponseEntity.noContent().build();
    }
}
