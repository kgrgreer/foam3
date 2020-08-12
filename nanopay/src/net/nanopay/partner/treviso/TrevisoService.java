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
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.UserCapabilityJunction;
import net.nanopay.country.br.CNPJ;
import net.nanopay.country.br.ExchangeServiceInterface;
import net.nanopay.country.br.FederalRevenueService;
import net.nanopay.country.br.OpenDataService;
import net.nanopay.country.br.PTaxRate;
import net.nanopay.country.br.PTaxDollarRateResponse;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.FXTransaction;
import net.nanopay.meter.clearing.ClearingTimeService;
import net.nanopay.model.Business;
import net.nanopay.partner.sintegra.SintegraService;
import net.nanopay.partner.sintegra.CPFResponseData;
import net.nanopay.partner.sintegra.CNPJResponseData;
import net.nanopay.partner.treviso.api.Boleto;
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

public class TrevisoService extends ContextAwareSupport implements TrevisoServiceInterface, FXService, FederalRevenueService {

  private TrevisoAPIServiceInterface trevisoAPIService;
  private ExchangeServiceInterface exchangeService;
  private final Logger logger_;

  public TrevisoService(X x, final TrevisoAPIServiceInterface trevisoAPIService, final ExchangeServiceInterface exchangeService) {
    this.trevisoAPIService = trevisoAPIService;
    this.exchangeService = exchangeService;
    setX(x);
    this.logger_ = (Logger) x.get("logger");
  }

  public TrevisoClient createEntity(X x, long userId) {
    TrevisoClient client = findClient(userId);
    if ( client != null ) return client;

    User user = (User) ((DAO) x.get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    try {
      SaveEntityRequest request = buildSaveEntityRequest(x, user, findCpfCnpj(userId));
      FepWebResponse res = trevisoAPIService.saveEntity(request);
      if ( res != null && res.getCode() != 0 )
        throw new RuntimeException("Error onboarding Treviso client to FepWeb. " + res.getMessage());

      return saveTrevisoClient(user.getId(), "Active");
    } catch(Throwable t) {
      throw new RuntimeException(t);
    }
  }

  public void updateEntity(X x, long userId) {
    User user = (User) ((DAO) x.get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    try {
      SaveEntityRequest request = buildSaveEntityRequest(x, user, findCpfCnpj(userId));
      FepWebResponse res = trevisoAPIService.saveEntity(request);
      if ( res == null )
        throw new RuntimeException("Update failed. No response from FepWeb.");
      if ( res != null && res.getCode() != 0 )
        throw new RuntimeException("Error updating Treviso client on FepWeb. " + res.getMessage());

    } catch(Throwable t) {
      throw t;
    }
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
        return saveTrevisoClient(user.getId(), entity.getStatus());
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
    request.setPersonType((user instanceof Business) ? "J" : "P");
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

  public TrevisoClient findClient(long user) {
    return (TrevisoClient) ((DAO)
      getX().get("trevisoClientDAO")).find(EQ(TrevisoClient.USER, user));
  }

  protected TrevisoClient saveTrevisoClient(long userId, String status) {
    DAO trevisoClientDAO = (DAO) getX().get("trevisoClientDAO");
    TrevisoClient client  = findClient(userId);
    if ( client == null ) {
      client = (TrevisoClient) trevisoClientDAO.put(new TrevisoClient.Builder(getX())
        .setUser(userId)
        .setStatus(status)
        .build());
    }
    return client;
  }

  protected String getName(User user) {
    if ( user instanceof Business ) return ((Business) user).getBusinessName();
    return user.getLegalName();
  }

  protected String findCpfCnpj(long userId) {
    Capability cnpjCapability = (Capability) ((DAO) getX().get("capabilityDAO")).find(EQ(Capability.NAME, "CNPJ"));
    if ( cnpjCapability != null ) {
      UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) getX().get("userCapabilityJunctionDAO")).find(AND(
        EQ(UserCapabilityJunction.TARGET_ID, cnpjCapability.getId()),
        EQ(UserCapabilityJunction.SOURCE_ID, userId)
      ));

      if ( ucj != null ) return ucj.getData() != null ? ((CNPJ)ucj.getData()).getData() : "";
    }

    return ""; // TODO Pending CNPJ Capability
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

  public TrevisoClient createExchangeCustomerDefault(long userId, String cnpj) throws RuntimeException {
    return createExchangeCustomer(userId, 1000000L, cnpj); // Default limit
  }

  public TrevisoClient createExchangeCustomer(long userId, long amount, String cnpj) throws RuntimeException {
    try {
      if ( getExchangeCustomer(userId, cnpj) != null ) return findClient(userId); // User already pushed to Exchange
    } catch(Throwable t) {
      logger_.error("Error fetching exchange user" , t);
    }

    InsertTitular request = new InsertTitular();
    request.setDadosTitular(getTitularRequest(userId, amount, cnpj));
    try {
      InsertTitularResponse response = exchangeService.insertTitular(request);
      if ( response == null || response.getInsertTitularResult() == null )
        throw new RuntimeException("Unable to get a valid response from Exchange while calling insertTitular");

      if ( response.getInsertTitularResult().getCODRETORNO() != 0 )
        throw new RuntimeException("Error while calling insertTitular: " + response.getInsertTitularResult().getMENSAGEM());

      return saveTrevisoClient(userId, "Active");
    } catch(Throwable t) {
      logger_.error("Error updating Titular" , t);
      throw new RuntimeException(t);
    }
  }

  public Titular getExchangeCustomer(long userId, String cpfCnpj) throws RuntimeException {
    SearchTitular request = new SearchTitular();
    String formattedcpfCnpj = cpfCnpj.replaceAll("[^0-9]", "");
    request.setCODIGO(formattedcpfCnpj); // 10786348070
    SearchTitularResponse response = exchangeService.searchTitular(request);
    if ( response == null || response.getSearchTitularResult() == null )
      throw new RuntimeException("Unable to get a valid response from Exchange while calling SearchTitular");

    ServiceStatus status = response.getSearchTitularResult().getServiceStatus();
    if ( status == null )
      throw new RuntimeException("Unable to get a valid response from Exchange while calling SearchTitular");

    if ( status.getCODRETORNO() != 0 || response.getSearchTitularResult().getTitular() == null )
      throw new RuntimeException("Error while calling SearchTitular: " + status.getMENSAGEM());

    return response.getSearchTitularResult().getTitular();
  }

  public long getTransactionLimit(long userId) throws RuntimeException {
    return new Double(getExchangeCustomer(userId, findCpfCnpj(userId)).getLIMITEOP()).longValue();
  }

  public void updateTransactionLimit(long userId, long amount) throws RuntimeException {
    UpdateTitular request = new UpdateTitular();
    Titular titular = getTitularRequest(userId, amount, findCpfCnpj(userId));
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

  protected Titular getTitularRequest(long userId, long amount, String cpfCnpj) {
    User user = (User) ((DAO) getX().get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);
    if ( user.getAddress() == null ) throw new RuntimeException("User address cannot be null: " + userId);

    Titular titular = new Titular();
    TrevisoCredientials credentials = (TrevisoCredientials) getX().get("TrevisoCredientials");
    titular.setAGENCIA(credentials.getExchangeAgencia());
    titular.setDTINICIO(user.getCreated());
    String formattedCpfCnpj = cpfCnpj.replaceAll("[^0-9]", "");
    titular.setCODIGO(formattedCpfCnpj); // e.g 10786348070
    titular.setTIPO(1);
    titular.setSUBTIPO("J"); // F = Physical, J = Legal, S = Symbolic
    titular.setNOMEAB(getName(user));
    titular.setNOME(getName(user));
    titular.setENDERECO(user.getAddress().getAddress());
    titular.setCIDADE(user.getAddress().getCity());
    titular.setESTADO(user.getAddress().getRegionId());
    titular.setCEP(user.getAddress().getPostalCode());
    titular.setPAIS("1058"); // TODO Pais do Cliente – Código Bacen - Brazil
    titular.setPAISMT("1058"); // TODO Pais Matriz do Cliente - Bacen Code - Brazil
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
    String formattedCpfCnpj = findCpfCnpj(user.getId()).replaceAll("[^0-9]", "");
    dadosBoleto.setCNPJPCPFCLIENTE(formattedCpfCnpj); // eg 10786348070

    SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
    Date completionDate = transaction.getCompletionDate();
    if ( completionDate == null )
      completionDate = ((ClearingTimeService) getX().get("clearingTimeService")).estimateCompletionDateSimple(getX(), transaction);

    try {
      String completionDateString = sdf.format(completionDate);
      dadosBoleto.setDATALQ(completionDateString);
      dadosBoleto.setDATAME(completionDateString); // TODO Foreign currency delivery date ( DD / MM / YYYY)
      dadosBoleto.setDATAMN(completionDateString); // TODO National currency delivery date ( DD / MM / YYYY)
    } catch(Throwable t) {
      logger_.error("Unable to parse completion date", t);
      throw new RuntimeException("Error inserting boleto. Cound not parse completion date.");
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

  public boolean validateCnpj(String cnpj) throws RuntimeException {
    try {
      String formattedCnpj = cnpj.replaceAll("[^0-9]", "");
      TrevisoCredientials credentials = (TrevisoCredientials) getX().get("TrevisoCredientials");
      if ( null == credentials ) throw new RuntimeException("Invalid credientials. Treviso token required to validate CNPJ");
      CNPJResponseData data = new SintegraService(getX()).getCNPJData(formattedCnpj, credentials.getSintegraToken());
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CNPJ validation.");

      if ( ! "0".equals(data.getCode()) ) throw new RuntimeException(data.getMessage());

      return "ATIVA".equals(data.getSituacao());
    } catch(Throwable t) {
      logger_.error("Error validating CNPJ" , t);
      throw new RuntimeException(t);
    }
  }

  public boolean validateCpf(String cpf, long userId) throws RuntimeException {
    User user = (User) ((DAO) getX().get("bareUserDAO")).find(userId);
    if ( user == null ) throw new RuntimeException("User not found: " + userId);

    String birthDate = "";
    try {
      SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      birthDate = sdf.format(user.getBirthday());
    } catch(Throwable t) {
      logger_.error("Unable to parse user birth date: " + userId , t);
      throw new RuntimeException("Unable to parse user birth date.");
    }

    try {
      String formattedCpf = cpf.replaceAll("[^0-9]", "");
      TrevisoCredientials credentials = (TrevisoCredientials) getX().get("TrevisoCredientials");
      if ( null == credentials ) throw new RuntimeException("Invalid credientials. Treviso token required to validate CPF");
      CPFResponseData data = new SintegraService(getX()).getCPFData(formattedCpf, birthDate, credentials.getSintegraToken());
      if ( data == null ) throw new RuntimeException("Unable to get a valid response from CPF validation.");

      if ( ! "0".equals(data.getCode()) ) throw new RuntimeException(data.getMessage());

      return "Regular".equals(data.getSituacaoCadastral());
    } catch(Throwable t) {
      logger_.error("Error validating CPF" , t);
      throw new RuntimeException(t);
    }
  }

}
