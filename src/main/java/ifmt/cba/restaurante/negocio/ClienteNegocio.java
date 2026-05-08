package ifmt.cba.restaurante.negocio;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ifmt.cba.restaurante.dto.BairroDTO;
import ifmt.cba.restaurante.dto.ClienteDTO;
import ifmt.cba.restaurante.dto.EnderecoCepDTO;
import ifmt.cba.restaurante.entity.Bairro;
import ifmt.cba.restaurante.entity.Cliente;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.integration.viacep.ViaCepClient;
import ifmt.cba.restaurante.repository.BairroRepository;
import ifmt.cba.restaurante.repository.ClienteRepository;

@Service
public class ClienteNegocio {

    private ModelMapper modelMapper;

	@Autowired
	private ClienteRepository clienteRepository;

	@Autowired
	private BairroRepository bairroRepository;

	@Autowired
	private ViaCepClient viaCepClient;

	public ClienteNegocio() {
		this.modelMapper = new ModelMapper();
	}

	public ClienteDTO inserir(ClienteDTO clienteDTO) throws NotValidDataException, NotFoundException {

		this.preencherEnderecoPorCep(clienteDTO);
		Cliente cliente = this.toEntity(clienteDTO);
		String mensagemErros = cliente.validar();

		if (!mensagemErros.isEmpty()) {
			throw new NotValidDataException(mensagemErros);
		}

		try {
			if (clienteRepository.findByCPF(cliente.getCPF()) != null) {
				throw new NotValidDataException("Ja existe esse cliente");
			}
			cliente = clienteRepository.save(cliente);
		} catch (Exception ex) {
			throw new NotValidDataException("Erro ao incluir o cliente - " + ex.getMessage());
		}
		return this.toDTO(cliente);
	}

	public ClienteDTO alterar(ClienteDTO clienteDTO) throws NotValidDataException, NotFoundException {

		this.preencherEnderecoPorCep(clienteDTO);
		Cliente cliente = this.toEntity(clienteDTO);
		String mensagemErros = cliente.validar();
		if (!mensagemErros.isEmpty()) {
			throw new NotValidDataException(mensagemErros);
		}
		try {
			if (cliente.getCodigo() <= 0 || !clienteRepository.existsById(cliente.getCodigo())) {
				throw new NotFoundException("Nao existe esse cliente");
			}
			cliente = clienteRepository.save(cliente);
		} catch (NotFoundException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new NotValidDataException("Erro ao alterar o cliente - " + ex.getMessage());
		}
		return this.toDTO(cliente);
	}

	public void excluir(int codigo) throws NotValidDataException, NotFoundException {

		try {
			Cliente cliente = clienteRepository.findById(codigo).get();
			if (cliente == null) {
				throw new NotFoundException("Nao existe esse cliente");
			}

			clienteRepository.delete(cliente);
		} catch (Exception ex) {
			throw new NotValidDataException("Erro ao excluir o cliente - " + ex.getMessage());
		}
	}

	public List<ClienteDTO> pesquisaTodos() throws NotFoundException {
		try {
			return this.toDTOAll(clienteRepository.findAll());
		} catch (Exception ex) {
			throw new NotFoundException("Erro ao pesquisar cliente - " + ex.getMessage());
		}
	}

	public ClienteDTO pesquisaPorNome(String parteNome) throws NotFoundException {
		try {
			return this.toDTO(clienteRepository.findByNomeIgnoreCaseStartingWith(parteNome));
		} catch (Exception ex) {
			throw new NotFoundException("Erro ao pesquisar cliente pelo nome - " + ex.getMessage());
		}
	}

	public ClienteDTO pesquisaCodigo(int codigo) throws NotFoundException {
		try {
			return this.toDTO(clienteRepository.findById(codigo).get());
		} catch (Exception ex) {
			throw new NotFoundException("Erro ao pesquisar cliente pelo codigo - " + ex.getMessage());
		}
	}

	public List<ClienteDTO> toDTOAll(List<Cliente> listaCliente) {
		List<ClienteDTO> listaDTO = new ArrayList<ClienteDTO>();

		for (Cliente cliente : listaCliente) {
			listaDTO.add(this.toDTO(cliente));
		}
		return listaDTO;
	}

	public ClienteDTO toDTO(Cliente cliente) {
		return this.modelMapper.map(cliente, ClienteDTO.class);
	}

	public Cliente toEntity(ClienteDTO clienteDTO) {
		return this.modelMapper.map(clienteDTO, Cliente.class);
	}

	public EnderecoCepDTO pesquisarEnderecoPorCep(String cep) throws NotFoundException, NotValidDataException {
		return viaCepClient.consultarEndereco(cep);
	}

	private void preencherEnderecoPorCep(ClienteDTO clienteDTO) throws NotFoundException, NotValidDataException {
		if (clienteDTO.getCep() == null || clienteDTO.getCep().isBlank()) {
			return;
		}

		EnderecoCepDTO enderecoCepDTO = viaCepClient.consultarEndereco(clienteDTO.getCep());
		if (enderecoCepDTO.getLogradouro() == null || enderecoCepDTO.getLogradouro().isBlank()) {
			throw new NotValidDataException("CEP nao retornou logradouro");
		}
		if (enderecoCepDTO.getBairro() == null || enderecoCepDTO.getBairro().isBlank()) {
			throw new NotValidDataException("CEP nao retornou bairro");
		}

		Bairro bairro = bairroRepository.findByNomeIgnoreCaseStartingWith(enderecoCepDTO.getBairro());
		if (bairro == null) {
			throw new NotFoundException("Bairro do CEP nao cadastrado: " + enderecoCepDTO.getBairro());
		}

		clienteDTO.setLogradouro(enderecoCepDTO.getLogradouro());
		clienteDTO.setBairro(new BairroDTO(bairro.getCodigo(), bairro.getNome(), bairro.getCustoEntrega()));
	}
}
