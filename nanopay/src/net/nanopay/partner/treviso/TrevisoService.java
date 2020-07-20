/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */
package net.nanopay.partner.treviso;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

import net.nanopay.bank.BankAccount;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.FXTransaction;
import net.nanopay.model.Business;
import net.nanopay.partner.treviso.api.Boleto;
import net.nanopay.partner.treviso.api.ExchangeServiceInterface;
import net.nanopay.partner.treviso.api.ClientStatus;
import net.nanopay.partner.treviso.api.CurrentPlatform;
import net.nanopay.partner.treviso.api.Document;
import net.nanopay.partner.treviso.api.Entity;
import net.nanopay.partner.treviso.api.FepWebResponse;
import net.nanopay.partner.treviso.api.InsertBoleto;
import net.nanopay.partner.treviso.api.InsertBoletoResponse;
import net.nanopay.partner.treviso.api.InsertTitular;
import net.nanopay.partner.treviso.api.InsertTitularResponse;
import net.nanopay.partner.treviso.api.Natureza;
import net.nanopay.partner.treviso.api.PTaxRate;
import net.nanopay.partner.treviso.api.PTaxDollarRateResponse;
import net.nanopay.partner.treviso.api.ResponsibleArea;
import net.nanopay.partner.treviso.api.SaveEntityRequest;
import net.nanopay.partner.treviso.api.SearchCustomerRequest;
import net.nanopay.partner.treviso.api.SearchCustomerResponse;
import net.nanopay.partner.treviso.api.SearchNatureza;
import net.nanopay.partner.treviso.api.SearchNaturezaResponse;
import net.nanopay.partner.treviso.api.SearchTitular;
import net.nanopay.partner.treviso.api.SearchTitularResponse;
import net.nanopay.partner.treviso.api.ServiceStatus;
import net.nanopay.partner.treviso.api.Titular;
import net.nanopay.partner.treviso.api.TrevisoAPIServiceInterface;
import net.nanopay.partner.treviso.api.UpdateTitular;
import net.nanopay.partner.treviso.api.UpdateTitularResponse;
import net.nanopay.payment.Institution;
import net.nanopay.tx.model.Transaction;

public class TrevisoService extends ContextAwareSupport implements TrevisoServiceInterface, FXService {

  private TrevisoAPIServiceInterface trevisoAPIService;
  private ExchangeServiceInterface exchangeService;
  private final Logger logger_;

  public TrevisoService(X x, final TrevisoAPIServiceInterface trevisoAPIService, final ExchangeServiceInterface exchangeService) {
    this.trevisoAPIService = trevisoAPIService;
    this.exchangeService = exchangeService;
    setX(x);
    this.logger_ = (Logger) x.get("logger");
  }

  public TrevisoClient createEntity(X x, long userId, String cnpj) {
    TrevisoClient client = findEntity(x, userId);
    if ( client != null ) return client;

    User user = (User) ((DAO) x.get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    try {
      SaveEntityRequest request = buildSaveEntityRequest(x, user, cnpj);
      FepWebResponse res = trevisoAPIService.saveEntity(request);
      if ( res != null ) {
        return saveTrevisoClient(x, user, request.getStatus(), request.getCnpjCpf());
      }
    } catch(Throwable t) {
      logger_.error("Error onboarding Treviso client.", t);
      throw new RuntimeException("Error onboarding Treviso client.");
    }

    return null;
  }

  public TrevisoClient searchCustomer(X x, long userId) {
    User user = (User) ((DAO) x.get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    try {
      SearchCustomerRequest request = new SearchCustomerRequest();
      request.setExtCode(user.getId());
      SearchCustomerResponse res = trevisoAPIService.searchCustomer(request);
      if ( res != null && res.getEntityDTOList() != null && res.getEntityDTOList().length > 0  ) {
        Entity entity = (Entity) res.getEntityDTOList()[0];
        return saveTrevisoClient(x, user, entity.getStatus(), entity.getCnpjCpf());
      }
    } catch(Throwable t) {
      logger_.error("Error searching Treviso client.", t);
      throw new RuntimeException("Error searching Treviso client. " + t.getMessage());
    }

    return null;
  }

  protected SaveEntityRequest buildSaveEntityRequest(X x, User user, String cnpj) {
    Region region = user.getAddress().findRegionId(x);
    SaveEntityRequest request = new SaveEntityRequest();
    request.setExtCode(user.getId());
    request.setPersonType("J");
    request.setSocialName(getName(user));
    request.setCnpjCpf(cnpj);
    request.setIe(region.getName());
    request.setIm(user.getAddress().getCity());
    TrevisoCredientials credentials = (TrevisoCredientials) x.get("TrevisoCredientials");
    ResponsibleArea area = new ResponsibleArea();
    if ( credentials != null ) {
      area.setExtCode(credentials.getFepWebCode());
      area.setRespAreaNm(credentials.getFepWebCodeName());
      CurrentPlatform platform = new CurrentPlatform();
      platform.setExtCode(credentials.getFepWebCode()); // Set from where?
      platform.setPltfrmNm(credentials.getFepWebCodeName()); // TODO should this be hardcoded?
      area.setCurrentPlatform(platform);
    }
    request.setResponsibleArea(area);
    request.setDocuments(buildCustomerDocuments(user));
    request.setStatus("A");
    request.setFlagDgtlSign(1); // TODO

    return request;
  }

  protected Document[] buildCustomerDocuments(User user) {
    return null;
  }

  public TrevisoClient findEntity(X x, long user) {
    return (TrevisoClient) ((DAO)
      x.get("trevisoClientDAO")).find(EQ(TrevisoClient.USER, user)); // TODO: Call Find Client API
  }

  protected TrevisoClient saveTrevisoClient(X x, User user, String status, String cnpj) {
    TrevisoClient client = new TrevisoClient.Builder(x)
      .setUser(user.getId())
      .setStatus(status)
      .setCnpj(cnpj)
      .build();
    return (TrevisoClient) ((DAO)
      x.get("trevisoClientDAO")).put(client);
  }

  protected String getName(User user) {
    if ( user instanceof Business ) return ((Business) user).getBusinessName();
    return user.getLegalName();
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
                           String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {
    // Logic Pending when Treviso API is ready
    FXQuote fxQuote = new FXQuote();
    fxQuote.setSourceCurrency(sourceCurrency);
    fxQuote.setTargetCurrency(targetCurrency);
    fxQuote.setExternalId("");
    fxQuote.setRate(5.0);

    Double amount = 0.0;

    if ( sourceAmount < 1 ) {
      amount = destinationAmount * fxQuote.getRate();
      sourceAmount = Math.round(amount);
    }

    if ( destinationAmount < 1 ) {
      amount = sourceAmount * fxQuote.getRate();
      destinationAmount = Math.round(amount);
    }

    fxQuote.setTargetAmount(destinationAmount);
    fxQuote.setSourceAmount(sourceAmount);

    return fxQuote;
  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    // TODO: Decide whether to this is necessary
    return true;
  }

  public long getTransactionLimit(long userId) throws RuntimeException {
    SearchTitular request = new SearchTitular();
    request.setCODIGO("10786348070"); // TODO CPF/CNPJ saved where?
    SearchTitularResponse response = exchangeService.searchTitular(request);
    if ( response == null || response.getSearchTitularResult() == null )
      throw new RuntimeException("Unable to get a valid response from Exchange while calling SearchTitular");

    ServiceStatus status = response.getSearchTitularResult().getServiceStatus();
    if ( status == null )
      throw new RuntimeException("Unable to get a valid response from Exchange while calling SearchTitular");

    if ( status.getCODRETORNO() != 0 || response.getSearchTitularResult().getTitular() == null )
      throw new RuntimeException("Error while calling SearchTitular: " + status.getMENSAGEM());

    return new Double(response.getSearchTitularResult().getTitular().getLIMITEOP()).longValue();
  }

  public void insertTransactionLimit(long userId, long amount) throws RuntimeException {
    InsertTitular request = new InsertTitular();
    Titular titular = getTitularRequest(userId, amount);
    try {
      InsertTitularResponse response = exchangeService.insertTitular(request);
      if ( response == null || response.getInsertTitularResult() == null )
        throw new RuntimeException("Unable to get a valid response from Exchange while calling insertTitular");

      if ( response.getInsertTitularResult().getCODRETORNO() != 0 )
        throw new RuntimeException("Error while calling updateTitular: " + response.getInsertTitularResult().getMENSAGEM());
    } catch(Throwable t) {
      logger_.error("Error updating Titular" , t);
      throw new RuntimeException(t);
    }
  }

  public void updateTransactionLimit(long userId, long amount) throws RuntimeException {
    UpdateTitular request = new UpdateTitular();
    Titular titular = getTitularRequest(userId, amount);
    request.setDadosTitular(titular);

    try {
      UpdateTitularResponse response = exchangeService.updateTitular(request);
      if ( response == null || response.getUpdateTitularResult() == null )
        throw new RuntimeException("Unable to get a valid response from Exchange while calling updateTitular");

      if ( response.getUpdateTitularResult().getCODRETORNO() != 0 )
        throw new RuntimeException("Error while calling updateTitular: " + response.getUpdateTitularResult().getMENSAGEM());
    } catch(Throwable t) {
      logger_.error("Error updating Titular" , t);
      throw new RuntimeException(t);
    }
  }

  protected Titular getTitularRequest(long userId, long amount) {
    User user = (User) ((DAO) getX().get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    Titular titular = new Titular();
    titular.setDTINICIO(user.getCreated());
    titular.setCODIGO("10786348070"); // TODO CPF/CNPJ saved where?
    titular.setTIPO(1);
    titular.setSUBTIPO("J"); // F = Physical, J = Legal, S = Symbolic
    titular.setNOMEAB(getName(user));
    titular.setNOME(getName(user));
    titular.setENDERECO(user.getAddress().getAddress());
    titular.setCIDADE(user.getAddress().getCity());
    Region region = user.getAddress().findRegionId(getX());
    titular.setESTADO(region == null ? "" : region.getName());
    titular.setCEP(user.getAddress().getPostalCode());
    titular.setPAIS(user.getAddress().getCountryId());
    titular.setPAISMT(user.getAddress().getCountryId()); // TODO Pais Matriz do Cliente - Bacen Code
    titular.setLIMITEOP(new Long(amount).doubleValue());

    return titular;
  }

  public Transaction createTransaction(Transaction transaction) throws RuntimeException {
    BankAccount bankAccount = (BankAccount)transaction.findSourceAccount(getX());
    if ( null == bankAccount ) throw new RuntimeException("Invalid source bank account " + transaction.getId());
    User user = (User) ((DAO) getX().get("bareUserDAO")).find(bankAccount.getOwner());
    if ( user == null ) throw new RuntimeException("User not found: " + bankAccount.getOwner());

    InsertBoleto request = new InsertBoleto();
    Boleto dadosBoleto = new Boleto();
    TrevisoCredientials credentials = (TrevisoCredientials) getX().get("TrevisoCredientials");
    dadosBoleto.setAGENCIA(credentials.getExchangeAgencia());
    dadosBoleto.setBANCO(bankAccount.getBankCode());

    Institution institution = (Institution) ((DAO) getX().get("institutionDAO")).find(bankAccount.getInstitution());
    if ( institution != null ) {
      dadosBoleto.setBANCOBEN1(institution.getSwiftCode());
    }

    Address bankAddress = bankAccount.getAddress() == null ? bankAccount.getBankAddress() : bankAccount.getAddress();
    if ( bankAddress != null ) {
      dadosBoleto.setBANCOBEN3(bankAddress.getCity());
    }

    dadosBoleto.setCLAUSULAXX(false);
    dadosBoleto.setCNPJPCPFCLIENTE("10786348070"); // TODO CPF/CNPJ

    SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
    try {
      String today = sdf.format(new Date());
      dadosBoleto.setDATALQ(today); // TODO Settlement date ( DD / MM / YYYY)
      dadosBoleto.setDATAME(today); // TODO Foreign currency delivery date ( DD / MM / YYYY)
      dadosBoleto.setDATAMN(today); // TODO National currency delivery date ( DD / MM / YYYY)
    } catch(Throwable t) {
      logger_.error("Unable to parse settlement date", t);
      throw new RuntimeException("Error inserting boleto. Cound not parse date.");
    }

    if ( user instanceof Business ) {
      try {
        dadosBoleto.setDATAOP(sdf.format(((Business) user).getBusinessRegistrationDate()));
      } catch(Throwable t) {
        logger_.error("Unable to parse business registration date", t);
        throw new RuntimeException("Error inserting boleto. Cound not parse business registration date.");
      }
    }

    // TODO consider fixing problem with parsing default values because we are checking PropertyInfo isSet.
    dadosBoleto.setFORMAME(dadosBoleto.getFORMAME());
    dadosBoleto.setFORMAMN(dadosBoleto.getFORMAMN());
    dadosBoleto.setGIRO(dadosBoleto.getGIRO());
    dadosBoleto.setIMPRESSO(dadosBoleto.getIMPRESSO());
    dadosBoleto.setOPLINHA(dadosBoleto.getOPLINHA());
    dadosBoleto.setPAIS(dadosBoleto.getPAIS());
    dadosBoleto.setPARIDADE(dadosBoleto.getPARIDADE());
    dadosBoleto.setPLATBMF(dadosBoleto.getPLATBMF());
    dadosBoleto.setRSISB(dadosBoleto.getRSISB());
    dadosBoleto.setSEGMENTO(dadosBoleto.getSEGMENTO());
    dadosBoleto.setTIPO(dadosBoleto.getTIPO());

    dadosBoleto.setSTATUS("R"); // "R" - Pre-Boleto
    if ( transaction instanceof FXTransaction ) {
      dadosBoleto.setTAXAOP(((FXTransaction) transaction).getFxRate() );
    } else {
      dadosBoleto.setTAXAOP(1);
    }

    dadosBoleto.setVALORME(transaction.getAmount());
    dadosBoleto.setVALORMN(transaction.getDestinationAmount());
    request.setDadosBoleto(dadosBoleto);
    InsertBoletoResponse response = exchangeService.insertBoleto(request);
    if ( response == null || response.getInsertBoletoResult() == null )
      throw new RuntimeException("Unable to get a valid response from Exchange while calling insertBoleto");

    if ( response.getInsertBoletoResult().getCODRETORNO() != 0 )
      throw new RuntimeException("Error while calling insertBoleto: " + response.getInsertBoletoResult().getMENSAGEM());

    transaction.setReferenceNumber(response.getInsertBoletoResult().getNRREFERENCE());
    return transaction;
  }

  public boolean validateCnpjCpf(String cnpjCpf) throws RuntimeException {
    // TODO: Implement appropriate treviso API
    return true;
  }

  public List searchNatureCode(String natureCode) throws RuntimeException {
    List<Natureza> natureCodes = new ArrayList<>();
    SearchNatureza request  = new SearchNatureza();
    request.setCD_NATUREZA(natureCode);
    try {
      SearchNaturezaResponse response = exchangeService.searchNatureza(request);
      if ( response == null || response.getSearchNaturezaResult() == null )
        throw new RuntimeException("Unable to get a valid response from Exchange while calling searchNatureza");

      ServiceStatus status = response.getSearchNaturezaResult().getServiceStatus();
      if ( status == null )
        throw new RuntimeException("Unable to get a valid response from Exchange while calling SearchTitular");

      if ( status.getCODRETORNO() != 0 )
        throw new RuntimeException("Error while calling searchNatureza: " + status.getMENSAGEM());

      if ( response.getSearchNaturezaResult().getNatureza() != null ) {
        for ( Natureza nCode : response.getSearchNaturezaResult().getNatureza().getNatureza() ) {
          natureCodes.add(nCode);
        }
      }

      return natureCodes;

    } catch(Throwable t) {
      logger_.error("Error searching nature code" , t);
      throw new RuntimeException(t);
    }
  }

  public PTaxRate getLatestPTaxRates() throws RuntimeException {
    try {
      PTaxDollarRateResponse response = trevisoAPIService.getLatestPTaxRates();
      if ( response == null )
        throw new RuntimeException("Unable to get a valid response from PTax open API");

      if ( response.getValue() != null && response.getValue().length > 0 ) return response.getValue()[0];

      return null;
    } catch(Throwable t) {
      logger_.error("Error getting PTax" , t);
      throw new RuntimeException(t);
    }
  }

}
