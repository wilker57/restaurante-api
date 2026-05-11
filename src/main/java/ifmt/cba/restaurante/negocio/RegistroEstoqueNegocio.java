package ifmt.cba.restaurante.negocio;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ifmt.cba.restaurante.dto.MovimentoEstoqueDTO;
import ifmt.cba.restaurante.dto.RegistroEstoqueDTO;
import ifmt.cba.restaurante.entity.Produto;
import ifmt.cba.restaurante.entity.RegistroEstoque;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.repository.ProdutoRepository;
import ifmt.cba.restaurante.repository.RegistroEstoqueRepository;

@Service
public class RegistroEstoqueNegocio {

    private ModelMapper modelMapper;

	@Autowired
	private RegistroEstoqueRepository registroRepository;

	@Autowired
	private ProdutoRepository produtoRepository;

	public RegistroEstoqueNegocio() {
		this.modelMapper = new ModelMapper();
	}

	@Transactional
	public RegistroEstoqueDTO inserir(RegistroEstoqueDTO registroEstoqueDTO) throws NotValidDataException, NotFoundException {

		RegistroEstoque registroEstoque = this.toEntity(registroEstoqueDTO);
		String mensagemErros = registroEstoque.validar();

		if (!mensagemErros.isEmpty()) {
			throw new NotValidDataException(mensagemErros);
		}

		try {
			Produto produtoTemp = this.buscarProduto(registroEstoque.getProduto().getCodigo());
			this.aplicarMovimentoEstoque(produtoTemp, registroEstoque.getMovimento(), registroEstoque.getQuantidade(), false);
			registroEstoque = registroRepository.save(registroEstoque);
		} catch (NotFoundException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new NotValidDataException("Erro ao incluir registro de estoque - " + ex.getMessage());
		}
		return this.toDTO(registroEstoque);
	}

	@Transactional
	public RegistroEstoqueDTO alterar(RegistroEstoqueDTO registroEstoqueDTO) throws NotValidDataException, NotFoundException {

		RegistroEstoque registroEstoque = this.toEntity(registroEstoqueDTO);
		String mensagemErros = registroEstoque.validar();

		if (!mensagemErros.isEmpty()) {
			throw new NotValidDataException(mensagemErros);
		}

		try {
			if (registroEstoque.getCodigo() <= 0) {
				throw new NotFoundException("Nao existe esse registro de estoque");
			}

			RegistroEstoque registroAnterior = registroRepository.findById(registroEstoque.getCodigo())
					.orElseThrow(() -> new NotFoundException("Nao existe esse registro de estoque"));

			Produto produtoAnterior = this.buscarProduto(registroAnterior.getProduto().getCodigo());
			this.aplicarMovimentoEstoque(produtoAnterior, registroAnterior.getMovimento(), registroAnterior.getQuantidade(), true);

			Produto produtoNovo;
			if (produtoAnterior.getCodigo() == registroEstoque.getProduto().getCodigo()) {
				produtoNovo = produtoAnterior;
			} else {
				produtoNovo = this.buscarProduto(registroEstoque.getProduto().getCodigo());
			}

			this.aplicarMovimentoEstoque(produtoNovo, registroEstoque.getMovimento(), registroEstoque.getQuantidade(), false);
			registroEstoque = registroRepository.save(registroEstoque);
		} catch (NotFoundException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new NotValidDataException("Erro ao alterar registro de estoque - " + ex.getMessage());
		}
		return this.toDTO(registroEstoque);
	}

	@Transactional
	public RegistroEstoqueDTO excluir(RegistroEstoqueDTO registroEstoqueDTO) throws NotValidDataException, NotFoundException {
		if (registroEstoqueDTO == null || registroEstoqueDTO.getCodigo() <= 0) {
			throw new NotValidDataException("Codigo do registro de estoque invalido");
		}
		return this.excluir(registroEstoqueDTO.getCodigo());
	}

	@Transactional
	public RegistroEstoqueDTO excluir(int codigo) throws NotValidDataException, NotFoundException {
		try {
			RegistroEstoque registroEstoque = registroRepository.findById(codigo)
					.orElseThrow(() -> new NotFoundException("Nao existe esse registro de estoque"));

			Produto produto = this.buscarProduto(registroEstoque.getProduto().getCodigo());
			this.aplicarMovimentoEstoque(produto, registroEstoque.getMovimento(), registroEstoque.getQuantidade(), true);
			registroRepository.delete(registroEstoque);
			return this.toDTO(registroEstoque);
		} catch (NotFoundException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new NotValidDataException("Erro ao excluir registro de estoque - " + ex.getMessage());
		}
	}

	public RegistroEstoqueDTO pesquisaCodigo(int codigo) throws NotFoundException {
		try {
			RegistroEstoque registroEstoque = registroRepository.findById(codigo).get();
			if (registroEstoque != null) {
				return this.toDTO(registroEstoque);
			} else {
				return null;
			}
		} catch (Exception ex) {
			throw new NotFoundException("Erro ao pesquisar registro de estoque pelo codigo - " + ex.getMessage());
		}
	}

    public List<RegistroEstoqueDTO> buscarPorMovimento(MovimentoEstoqueDTO movimento) throws NotFoundException {
        try {
			return this.toDTOAll(registroRepository.findByMovimento(movimento));
		} catch (Exception ex) {
			throw new NotFoundException("Erro ao pesquisar registro de estoque por tipo de movimento - " + ex.getMessage());
		}
    }

	public List<RegistroEstoqueDTO> buscarPorMovimentoEData(MovimentoEstoqueDTO movimento, LocalDate data) throws NotFoundException {
		try {
			return this.toDTOAll(registroRepository.findByMovimentoAndData(movimento, data));
		} catch (Exception ex) {
			throw new NotFoundException("Erro ao pesquisar registro de estoque por tipo de movimento e data - " + ex.getMessage());
		}
	}

	public List<RegistroEstoqueDTO> buscarPorProduto(Produto produto) throws NotFoundException {
		try {
			return this.toDTOAll(registroRepository.findByProduto(produto));
		} catch (Exception ex) {
			throw new NotFoundException("Erro ao pesquisar registro de estoque por produto - " + ex.getMessage());
		}
	}

	public List<RegistroEstoqueDTO> toDTOAll(List<RegistroEstoque> listaRegistro) {
		List<RegistroEstoqueDTO> listaDTO = new ArrayList<RegistroEstoqueDTO>();

		for (RegistroEstoque registroEstoque : listaRegistro) {
			listaDTO.add(this.toDTO(registroEstoque));
		}
		return listaDTO;
	}

	public RegistroEstoqueDTO toDTO(RegistroEstoque registroEstoque) {
		return this.modelMapper.map(registroEstoque, RegistroEstoqueDTO.class);
	}

	public RegistroEstoque toEntity(RegistroEstoqueDTO registroEstoqueDTO) {
		return this.modelMapper.map(registroEstoqueDTO, RegistroEstoque.class);
	}

	private Produto buscarProduto(int codigo) throws NotFoundException {
		return produtoRepository.findByIdForUpdate(codigo)
				.orElseThrow(() -> new NotFoundException("Nao existe esse produto"));
	}

	private void aplicarMovimentoEstoque(Produto produto, MovimentoEstoqueDTO movimento, int quantidade, boolean desfazer) {
		int fator = movimento == MovimentoEstoqueDTO.COMPRA ? 1 : -1;
		if (desfazer) {
			fator *= -1;
		}
		int novoEstoque = produto.getEstoque() + (fator * quantidade);
		if (novoEstoque < 0) {
			throw new IllegalArgumentException("Movimento deixaria o estoque negativo para o produto " + produto.getNome());
		}
		produto.setEstoque(novoEstoque);
		produtoRepository.save(produto);
	}
}
