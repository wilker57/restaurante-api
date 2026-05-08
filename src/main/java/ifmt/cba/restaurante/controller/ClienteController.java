package ifmt.cba.restaurante.controller;

import ifmt.cba.restaurante.dto.ClienteDTO;
import ifmt.cba.restaurante.dto.ConsultaCepDTO;
import ifmt.cba.restaurante.dto.EnderecoCepDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.negocio.ClienteNegocio;
import org.aspectj.weaver.ast.Not;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente")
public class ClienteController {

    private final ClienteNegocio clienteNegocio;

    public ClienteController(ClienteNegocio clienteNegocio){
        this.clienteNegocio = clienteNegocio;

    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ClienteDTO> buscarTodos() throws NotFoundException, NotValidDataException{
        return clienteNegocio.pesquisaTodos();
    }

    @GetMapping(value = "/codigo/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ClienteDTO buscaPorID(@PathVariable("codigo") int codigo) throws NotFoundException, NotValidDataException{
        return clienteNegocio.pesquisaCodigo(codigo);
    }

    @GetMapping(value = "/nome/{nome}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ClienteDTO buscarPorNome(@PathVariable("nome") String nome) throws NotFoundException, NotValidDataException{
        return clienteNegocio.pesquisaPorNome(nome);
    }

    @PostMapping(value = "/cep", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public EnderecoCepDTO buscarEnderecoPorCep(@RequestBody ConsultaCepDTO consultaCepDTO) throws NotFoundException, NotValidDataException{
        return clienteNegocio.pesquisarEnderecoPorCep(consultaCepDTO.getCep());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ClienteDTO inserirCliente(@RequestBody ClienteDTO clienteDTO) throws NotFoundException, NotValidDataException{
        return clienteNegocio.inserir(clienteDTO);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ClienteDTO alterarCliente(@RequestBody ClienteDTO clienteDTO) throws NotFoundException, NotValidDataException{
        return clienteNegocio.alterar(clienteDTO);
    }
    @DeleteMapping(value = "/{codigo}")
    public ResponseEntity<?> excluirCliente(@PathVariable("codigo") int codigo) throws NotFoundException, NotValidDataException{
        clienteNegocio.excluir(codigo);
        return ResponseEntity.noContent().build();
    }


}
