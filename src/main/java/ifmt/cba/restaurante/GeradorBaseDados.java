package ifmt.cba.restaurante;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import ifmt.cba.restaurante.dto.BairroDTO;
import ifmt.cba.restaurante.dto.ClienteDTO;
import ifmt.cba.restaurante.dto.GrupoAlimentarDTO;
import ifmt.cba.restaurante.dto.MovimentoEstoqueDTO;
import ifmt.cba.restaurante.dto.ProdutoDTO;
import ifmt.cba.restaurante.dto.RegistroEstoqueDTO;
import ifmt.cba.restaurante.exception.NotFoundException;
import ifmt.cba.restaurante.exception.NotValidDataException;
import ifmt.cba.restaurante.negocio.BairroNegocio;
import ifmt.cba.restaurante.negocio.ClienteNegocio;
import ifmt.cba.restaurante.negocio.GrupoAlimentarNegocio;
import ifmt.cba.restaurante.negocio.ProdutoNegocio;
import ifmt.cba.restaurante.negocio.RegistroEstoqueNegocio;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class GeradorBaseDados implements ApplicationListener<ApplicationStartedEvent> {

    @Autowired
    private BairroNegocio bairroNegocio;

    @Autowired
    private ClienteNegocio clienteNegocio;

    @Autowired
    private GrupoAlimentarNegocio grupoAlimentarNegocio;

    @Autowired
    private ProdutoNegocio produtoNegocio;

    @Autowired
    private RegistroEstoqueNegocio registroEstoqueNegocio;

    @Override
    public void onApplicationEvent(ApplicationStartedEvent event) {

        try {
            System.out.println("Iniciando a geracao da massa de dados");
            this.inserirBairro();
            this.inserirCliente();
            this.inserirGrupoAlimentar();
            this.inserirProduto();
            this.inserirMovimentoEstoque();
            System.out.println("Finalizado a geracao da massa de dados");

        } catch (NotValidDataException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (NotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

    }

    private void inserirMovimentoEstoque() throws NotValidDataException, NotFoundException {

        ProdutoDTO produtoDTO = produtoNegocio.pesquisaPorNome("Arroz Branco");

        RegistroEstoqueDTO registroEstoqueDTO = new RegistroEstoqueDTO();
        registroEstoqueDTO.setData(LocalDate.now());
        registroEstoqueDTO.setMovimento(MovimentoEstoqueDTO.COMPRA);
        registroEstoqueDTO.setProduto(produtoDTO);
        registroEstoqueDTO.setQuantidade(100);
        registroEstoqueNegocio.inserir(registroEstoqueDTO);

        produtoDTO = produtoNegocio.pesquisaPorNome("Alcatra bovina");
        registroEstoqueDTO = new RegistroEstoqueDTO();
        registroEstoqueDTO.setData(LocalDate.now());
        registroEstoqueDTO.setMovimento(MovimentoEstoqueDTO.VENCIMENTO);
        registroEstoqueDTO.setProduto(produtoDTO);
        registroEstoqueDTO.setQuantidade(50);
        registroEstoqueNegocio.inserir(registroEstoqueDTO);

        produtoDTO = produtoNegocio.pesquisaPorNome("Batata Doce");
        registroEstoqueDTO = new RegistroEstoqueDTO();
        registroEstoqueDTO.setData(LocalDate.now());
        registroEstoqueDTO.setMovimento(MovimentoEstoqueDTO.PRODUCAO);
        registroEstoqueDTO.setProduto(produtoDTO);
        registroEstoqueDTO.setQuantidade(80);
        registroEstoqueNegocio.inserir(registroEstoqueDTO);
    }

    private void inserirProduto() throws NotValidDataException, NotFoundException {

        GrupoAlimentarDTO grupoDTO = grupoAlimentarNegocio.pesquisaPorNome("Proteinas");

        ProdutoDTO produtoDTO = new ProdutoDTO();
        produtoDTO.setNome("Alcatra bovina");
        produtoDTO.setEstoque(1000);
        produtoDTO.setEstoqueMinimo(100);
        produtoDTO.setCustoUnidade(2.0f);
        produtoDTO.setValorEnergetico(50);
        produtoDTO.setGrupoAlimentar(grupoDTO);
        produtoNegocio.inserir(produtoDTO);

        produtoDTO = new ProdutoDTO();
        produtoDTO.setNome("Costela suina");
        produtoDTO.setEstoque(30);
        produtoDTO.setEstoqueMinimo(50);
        produtoDTO.setCustoUnidade(1.5f);
        produtoDTO.setValorEnergetico(60);
        produtoDTO.setGrupoAlimentar(grupoDTO);
        produtoNegocio.inserir(produtoDTO);

        grupoDTO = grupoAlimentarNegocio.pesquisaPorNome("Legumes");

        produtoDTO = new ProdutoDTO();
        produtoDTO.setNome("Batata Inglesa");
        produtoDTO.setEstoque(2000);
        produtoDTO.setEstoqueMinimo(300);
        produtoDTO.setCustoUnidade(1.0f);
        produtoDTO.setValorEnergetico(80);
        produtoDTO.setGrupoAlimentar(grupoDTO);
        produtoNegocio.inserir(produtoDTO);

        produtoDTO = new ProdutoDTO();
        produtoDTO.setNome("Batata Doce");
        produtoDTO.setEstoque(100);
        produtoDTO.setEstoqueMinimo(200);
        produtoDTO.setCustoUnidade(1.3f);
        produtoDTO.setValorEnergetico(70);
        produtoDTO.setGrupoAlimentar(grupoDTO);
        produtoNegocio.inserir(produtoDTO);

        grupoDTO = grupoAlimentarNegocio.pesquisaPorNome("Carboidratos");

        produtoDTO = new ProdutoDTO();
        produtoDTO.setNome("Arroz Branco");
        produtoDTO.setEstoque(1000);
        produtoDTO.setEstoqueMinimo(500);
        produtoDTO.setCustoUnidade(1.7f);
        produtoDTO.setValorEnergetico(100);
        produtoDTO.setGrupoAlimentar(grupoDTO);
        produtoNegocio.inserir(produtoDTO);

        produtoDTO = new ProdutoDTO();
        produtoDTO.setNome("Arroz Integral");
        produtoDTO.setEstoque(1000);
        produtoDTO.setEstoqueMinimo(500);
        produtoDTO.setCustoUnidade(1.9f);
        produtoDTO.setValorEnergetico(90);
        produtoDTO.setGrupoAlimentar(grupoDTO);
        produtoNegocio.inserir(produtoDTO);

        produtoDTO = new ProdutoDTO();
        produtoDTO.setNome("Fubá de Milho");
        produtoDTO.setEstoque(500);
        produtoDTO.setEstoqueMinimo(200);
        produtoDTO.setCustoUnidade(1.4f);
        produtoDTO.setValorEnergetico(75);
        produtoDTO.setGrupoAlimentar(grupoDTO);
        produtoNegocio.inserir(produtoDTO);
    }

    private void inserirBairro() throws NotValidDataException {

        BairroDTO bairroDTO = new BairroDTO();
        bairroDTO.setNome("Centro");
        bairroDTO.setCustoEntrega(7.00f);
        bairroNegocio.inserir(bairroDTO);

        bairroDTO = new BairroDTO();
        bairroDTO.setNome("Coxipo");
        bairroDTO.setCustoEntrega(8.00f);
        bairroNegocio.inserir(bairroDTO);

        bairroDTO = new BairroDTO();
        bairroDTO.setNome("Jardim Tres Americas");
        bairroDTO.setCustoEntrega(10.00f);
        bairroNegocio.inserir(bairroDTO);
    }

    private void inserirCliente() throws NotValidDataException, NotFoundException {

        BairroDTO bairroDTO = bairroNegocio.pesquisaPorNome("Centro");
        ClienteDTO clienteDTO = new ClienteDTO();
        clienteDTO.setNome("Cliente 01");
        clienteDTO.setCPF("234.345.656-55");
        clienteDTO.setRG("234567-9");
        clienteDTO.setTelefone("65 99999-7070");
        clienteDTO.setLogradouro("Rua das flores");
        clienteDTO.setNumero("123");
        clienteDTO.setPontoReferencia("Proximo a nada");
        clienteDTO.setBairro(bairroDTO);
        clienteNegocio.inserir(clienteDTO);

        bairroDTO = bairroNegocio.pesquisaPorNome("Coxipo");
        clienteDTO = new ClienteDTO();
        clienteDTO.setNome("Cliente 02");
        clienteDTO.setCPF("123.432.678-99");
        clienteDTO.setRG("123456-8");
        clienteDTO.setTelefone("65 98888-3030");
        clienteDTO.setLogradouro("Rua das pedras");
        clienteDTO.setNumero("456");
        clienteDTO.setPontoReferencia("Final da rua");
        clienteDTO.setBairro(bairroDTO);
        clienteNegocio.inserir(clienteDTO);
    }

    private void inserirGrupoAlimentar() throws NotValidDataException, NotFoundException {

        GrupoAlimentarDTO grupoDTO = new GrupoAlimentarDTO();
        grupoDTO.setNome("Carboidratos");
        grupoAlimentarNegocio.inserir(grupoDTO);

        grupoDTO = new GrupoAlimentarDTO();
        grupoDTO.setNome("Legumes");
        grupoAlimentarNegocio.inserir(grupoDTO);

        grupoDTO = new GrupoAlimentarDTO();
        grupoDTO.setNome("Proteinas");
        grupoAlimentarNegocio.inserir(grupoDTO);

        grupoDTO = new GrupoAlimentarDTO();
        grupoDTO.setNome("Verduras");
        grupoAlimentarNegocio.inserir(grupoDTO);

    }
}
