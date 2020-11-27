package net.nanopay.plaid;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.*;
import com.plaid.client.response.*;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.USBankAccount;
import net.nanopay.payment.Institution;
import net.nanopay.plaid.config.PlaidCredential;
import net.nanopay.plaid.model.*;
import retrofit2.Response;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class PlaidServiceImpl implements PlaidService {

  PlaidCredential credential;
  JSONParser jsonParser = new JSONParser();

  public PlaidServiceImpl() {
  }

  public PlaidServiceImpl(PlaidCredential credential) {
    this.credential = credential;
  }

  /**
   *
   * START FROM HERE
   *
   * Start the plaid integration process
   * 1. Exchange the public token for an API access token
   * 2. Retrieve all the account information related to this user from Plaid
   * 3. Import user selected account to Nanopay system
   *
   * @param x context
   * @param publicToken public token we get from front-end
   */
  @Override
  public PlaidResponseItem startIntegration(X x, PlaidPublicToken publicToken) throws IOException {
    Long   userId          = publicToken.getUserId();
    String institutionId   = publicToken.getInstitutionId();
    Map    selectedAccount = publicToken.getSelectedAccount();
    Logger logger          = (Logger) x.get("logger");
    PlaidResponseItem responseItem = new PlaidResponseItem();
    responseItem.setUserId(userId);
    responseItem.setInstitutionId(institutionId);
    PlaidError error = null;
    logger.info(userId + " start plaid integration.");

    try {

      exchangeForAccessToken        (x, publicToken);
      fetchAccountsDetail           (x, userId, institutionId);
      importSelectedAccountToSystem (x, userId, institutionId, selectedAccount, responseItem);
      return responseItem;

    } catch ( PlaidException e ) {

      try {
        error =
          (PlaidError) jsonParser.parseString(e.getErrorBody(), PlaidError.class);
        PlaidItem item = findItemBy(x, userId, institutionId);
        new PlaidErrorHandler(x, item.getItemId()).handleError(error);
        logger.error(userId + " " + error);
      } catch ( Exception e2 ) {
        throw e2;
      }

    } catch ( Exception e ) {
      logger.error(userId + " " + e.getMessage());
      throw e;
    }
    responseItem.setPlaidError(error);
    return responseItem;
  }


  /**
   * Exchange the public token for an API access token,
   * @see {<a href="https://plaid.com/docs/#exchange-token-flow">Exchange token flow</a>}
   *
   * We will save the plaid item and associated access token into plaidItemDAO
   */
  @Override
  public String exchangeForAccessToken(X x, PlaidPublicToken publicToken) throws IOException {
    PlaidClient plaidClient  = getClient(x);
    DAO         plaidItemDAO = (DAO) x.get("plaidItemDAO");

    if ( publicToken.getIsUpdateMode() ) {
      PlaidItem plaidItem = findItemBy(x, publicToken.getUserId(), publicToken.getInstitutionId());
      plaidItem = (PlaidItem) plaidItem.fclone();

      plaidItem.setLoginRequired(false);
      plaidItemDAO.put(plaidItem);

      return publicToken.getInstitutionId();
    }

    Response<ItemPublicTokenExchangeResponse> response =
      plaidClient.service()
        .itemPublicTokenExchange(new ItemPublicTokenExchangeRequest(publicToken.getPublicToken()))
        .execute();

    if (response.code() != 200) {
      throw new PlaidException(response.errorBody().string());
    }

    ItemPublicTokenExchangeResponse exchangeResponse = response.body();

    PlaidItem plaidItem = new PlaidItem.Builder(x)
      .setUserId          (publicToken.getUserId())
      .setInstitutionId   (publicToken.getInstitutionId())
      .setInstitutionName (publicToken.getInstitutionName())
      .setItemId          (exchangeResponse.getItemId())
      .setAccessToken     (exchangeResponse.getAccessToken())
      .build();

    if ( ! isDuplicateItem(x, plaidItem) ) {
      plaidItemDAO.put(plaidItem);
    } else {
      removeItemFromPlaidServer(x, plaidItem);
    }

    return publicToken.getInstitutionId();
  }

  /**
   * Fetch user's account information and save it to plaidAccountDetailDAO
   * @see {<a href="https://plaid.com/docs/#auth">Accounts</a>}
   *
   * @param plaidInstitutionId @see {<a href="https://plaid.com/docs/#institutions-by-id">Institution ID</a>}
   */
  @Override
  public void fetchAccountsDetail(X x, long userId, String plaidInstitutionId) throws IOException {
    PlaidClient plaidClient           = getClient(x);
    PlaidItem
                plaidItem             = findItemBy(x, userId, plaidInstitutionId);
    DAO         plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");

    Response<AuthGetResponse> response = plaidClient.service()
      .authGet(new AuthGetRequest(plaidItem.getAccessToken()))
      .execute();

    if (response.code() != 200) {
      throw new PlaidException(response.errorBody().string());
    }

    // get account detail from Plaid
    AuthGetResponse authGetResponse = response.body();
    List<Account> accounts = authGetResponse.getAccounts();
    AuthGetResponse.Numbers numbers = authGetResponse.getNumbers();

    Map<String, AuthGetResponse.NumberACH> ACHs = numbers.getACH().stream().
      collect(Collectors.toMap(AuthGetResponse.NumberACH::getAccountId, obj -> obj));

    Map<String, AuthGetResponse.NumberEFT> EFTs = numbers.getEFT().stream().
      collect(Collectors.toMap(AuthGetResponse.NumberEFT::getAccountId, obj -> obj));

    // Map the plaid account response to foam PlaidAccountDetail,
    // and store it to PlaidAccountDetailDAO
    accounts.stream().map(
      account -> {
        String accountId = account.getAccountId();
        ACH ach = null;
        EFT eft = null;

        if (ACHs.containsKey(accountId)) {
          ach = new ACH.Builder(x)
            .setAccount     (ACHs.get(accountId).getAccount())
            .setRouting     (ACHs.get(accountId).getRouting())
            .setWireRouting (ACHs.get(accountId).getWireRouting())
            .build();
        }

        if (EFTs.containsKey(accountId)) {
          eft = new EFT.Builder(x)
            .setAccount     (EFTs.get(accountId).getAccount())
            .setBranch      (EFTs.get(accountId).getBranch())
            .setInstitution (EFTs.get(accountId).getInstitution())
            .build();
        }


        Account.Balances temp = account.getBalances();
        PlaidBalances balances =
          new PlaidBalances.Builder(x)
            .setAvailable       (temp.getAvailable() != null ? temp.getAvailable() : -1.0)
            .setCurrent         (temp.getCurrent() != null ? temp.getCurrent() : -1.0)
            .setLimit           (temp.getLimit() != null ? temp.getLimit() : -1.0)
            .setIsoCurrencyCode (account.getBalances().getIsoCurrencyCode())
            .build();

        return new PlaidAccountDetail.Builder(x)
          .setUserId          (userId)
          .setItemId          (plaidItem.getItemId())
          .setInstitutionId   (plaidItem.getInstitutionId())
          .setInstitutionName (plaidItem.getInstitutionName())
          .setAccountId       (account.getAccountId())
          .setMask            (account.getMask())
          .setName            (account.getName())
          .setOfficialName    (account.getOfficialName())
          .setType            (account.getType())
          .setType            (account.getSubtype())
          .setACH             (ach)
          .setEFT             (eft)
          .setBalance         (balances)
          .build();
      })
      .forEach(plaidAccountDetailDAO::put);
  }


  /**
   *
   * @param selectedAccount Selected account from public token.
   *                        Key is the account mask, value is account name
   */
  @Override
  public void importSelectedAccountToSystem(X x, long userId, String plaidInstitutionId, Map selectedAccount, PlaidResponseItem responseItem) throws IOException {
    DAO plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");
    DAO accountDAO            = (DAO) x.get("localAccountDAO");
    PlaidItem
      plaidItem             = findItemBy(x, userId, plaidInstitutionId);

    ArraySink select = (ArraySink) plaidAccountDetailDAO.where(
      MLang.AND(
        MLang.EQ(PlaidAccountDetail.USER_ID, userId),
        MLang.EQ(PlaidAccountDetail.INSTITUTION_ID, plaidInstitutionId)))
      .select(new ArraySink());

    List<PlaidAccountDetail> accountDetails = ((List<PlaidAccountDetail>) select.getArray()).stream()
      .filter(accountDetail ->
        selectedAccount.containsKey(accountDetail.getMask()) &&
          selectedAccount.get(accountDetail.getMask()).equals(accountDetail.getName())
      ).collect(Collectors.toList());

    responseItem.setPlaidItem(plaidItem);
    for (PlaidAccountDetail accountDetail : accountDetails) {

      Institution institution =
        findInstitutionByName(x, accountDetail.getInstitutionName());

      if (accountDetail.getEFT() != null) {
        //TODO Should we store this to CA Bank Account
      }

      if (accountDetail.getACH() != null) {
        responseItem.setAccountDetail(accountDetail);
        responseItem.setAccount(new USBankAccount.Builder(x)
            .setBranchId      (accountDetail.getACH().getRouting())
            .setWireRouting   (accountDetail.getACH().getWireRouting())
            .setAccountNumber (accountDetail.getACH().getAccount())
            .setName          (accountDetail.getName())
            .setDenomination  (accountDetail.getBalance().getIsoCurrencyCode())
            .setOwner         (userId)
            .setStatus        (BankAccountStatus.VERIFIED)
            //.setCountry       ("US")
            .setInstitution   (institution.getId())
            .build());

      }
    }
  }

  public PlaidResponseItem saveAccount(X x, PlaidResponseItem plaidResponseItem) throws IOException{
    DAO accountDAO            = (DAO) x.get("localAccountDAO");
    PlaidResponseItem responseItem = new PlaidResponseItem();
    PlaidError error = null;
    Logger logger          = (Logger) x.get("logger");

    try {
      USBankAccount account = (USBankAccount) plaidResponseItem.getAccount();
      account.setVerifiedBy("PLAID");
      account = (USBankAccount) accountDAO.put(plaidResponseItem.getAccount());
      createReport(x, plaidResponseItem.getAccountDetail(),account.getId(), plaidResponseItem.getPlaidItem());
      return responseItem;
    } catch ( PlaidException e ) {

      try {
        error =
          (PlaidError) jsonParser.parseString(e.getErrorBody(), PlaidError.class);
        PlaidItem item = findItemBy(x, plaidResponseItem.getUserId(), plaidResponseItem.getInstitutionId());
        new PlaidErrorHandler(x, item.getItemId()).handleError(error);
        logger.error(plaidResponseItem.getUserId() + " " + error);
      } catch ( Exception e2 ) {
        throw e2;
      }

    } catch ( Exception e ) {
      logger.error(plaidResponseItem.getUserId() + " " + e.getMessage());
      throw e;
    }
    responseItem.setPlaidError(error);
    return responseItem;
  }

  public PlaidResultReport createReport(X x, PlaidAccountDetail accountDetail, String nanopayAccountId, PlaidItem plaidItem) throws IOException {
    PlaidClient plaidClient   = getClient(x);
    DAO plaidReportDAO        = (DAO) x.get("plaidResultReportDAO");
    User user                 = ((Subject) x.get("subject")).getUser();
    HttpServletRequest request = x.get(HttpServletRequest.class);
    PlaidResultReport report  = new PlaidResultReport();

    Response<IdentityGetResponse> response = plaidClient.service().identityGet(
      new IdentityGetRequest(plaidItem.getAccessToken())
    ).execute();

    IdentityGetResponse.Identity result = response.body().getIdentity();

    report.setNanopayUserId       (user.getId());
    report.setCompanyName         (user.getBusinessName());
    report.setPlaidId             (plaidItem.getItemId());
    report.setAccountHolderName   (result.getNames().get(0));
    report.setValidationDate      (new Date());
    report.setIp                  (request.getRemoteAddr());
    report.setAccountDetail       (accountDetail);
    report.setNanopayAccountId    (nanopayAccountId);

    return (PlaidResultReport) plaidReportDAO.inX(x).put(report);
  }

  /**
   * Remove the duplicate plaid items from the plaid server
   */
  public boolean removeItemFromPlaidServer(X x, PlaidItem plaidItem) throws IOException {
    PlaidClient client = getClient(x);
    Response<ItemRemoveResponse> response = client.service().itemRemove(
      new ItemRemoveRequest(plaidItem.getAccessToken())
    ).execute();

    if ( response.code() != 200 ) {
      throw new PlaidException(response.errorBody().string());
    }

    return response.body().getRemoved();
  }

  /**
   * Create the public token for the update mode
   */
  public String createPublicToken(X x, PlaidItem plaidItem) throws IOException {
    PlaidClient client = getClient(x);

    Response<ItemPublicTokenCreateResponse> response =
      client.service().itemPublicTokenCreate(
        new ItemPublicTokenCreateRequest(plaidItem.getAccessToken())).execute();

    if ( response.code() != 200 ) {
      throw new PlaidException(response.errorBody().string());
    }

    return response.body().getPublicToken();
  }

  public boolean isDuplicateItem(X x, PlaidItem plaidItem) throws IOException {
    DAO plaidItemDAO = (DAO) x.get("plaidItemDAO");

    Count count = (Count) plaidItemDAO.where(
      MLang.AND(
        MLang.EQ(PlaidItem.USER_ID, plaidItem.getUserId()),
        MLang.EQ(PlaidItem.INSTITUTION_ID, plaidItem.getInstitutionId())
      )
    ).select(new Count());

    return count.getValue() == 1;
  }

  public Institution findInstitutionByName(X x, String name) {
    DAO institutionDAO = (DAO) x.get("institutionDAO");

    Institution institution =
      (Institution) institutionDAO.inX(x).find(MLang.EQ(Institution.NAME, name));

    if ( institution == null ) {
      institution = (Institution) institutionDAO.put(
        new Institution.Builder(x)
        .setName(name)
        .setCountryId("US")
        .build()
      );
    }

    return institution;
  }

  public List<PlaidItem> findLoginRequiredItemBy(X x, Long userId) {
    DAO plaidItemDAO = (DAO) x.get("plaidItemDAO");

    ArraySink select = (ArraySink) plaidItemDAO.where(
      MLang.AND(
        MLang.EQ(PlaidItem.USER_ID, userId),
        MLang.EQ(PlaidItem.LOGIN_REQUIRED, true)))
      .select(new ArraySink());

    return select.getArray();
  }

  public PlaidItem findItemBy(X x, Long userId, String plaidInstitutionId) {
    DAO plaidItemDAO = (DAO) x.get("plaidItemDAO");

    ArraySink select = (ArraySink) plaidItemDAO.where(
      MLang.AND(
        MLang.EQ(PlaidItem.USER_ID, userId),
        MLang.EQ(PlaidItem.INSTITUTION_ID, plaidInstitutionId)))
      .select(new ArraySink());

    if (select.getArray().size() != 1) {
      throw new RuntimeException("No item or multiple item");
    }

    return (PlaidItem) select.getArray().get(0);
  }

  /**
   * We should never pass the client id and secret to the client-side
   */
  @Override
  public PlaidCredential getCredentialForClient(X x, long userId) throws IOException {
    PlaidCredential credential =
      this.credential !=  null ? this.credential : (PlaidCredential) x.get("plaidCredential");
    credential = (PlaidCredential) credential.fclone();

    AppConfig appConfig = (AppConfig) x.get("appConfig");

    List<PlaidItem> items = findLoginRequiredItemBy(x, userId);

    if ( items.size() != 0 ) {
      PlaidItem reLoginItem = items.get(0);
      credential.setToken(createPublicToken(x, reLoginItem));
    }

    credential.setWebhook(appConfig.getUrl() + "/service/plaidWebAgent");
    credential.setClientId("****");
    credential.setSecret("****");

    return credential;
  }

  public PlaidClient getClient(X x) {
    PlaidCredential credential =
      this.credential !=  null ? this.credential : (PlaidCredential) x.get("plaidCredential");

    return PlaidClient.newBuilder()
      .clientIdAndSecret (credential.getClientId(), credential.getSecret())
      .publicKey         (credential.getPublicKey())
      .baseUrl           ("https://" + credential.getEnv() + ".plaid.com")
      .build();
  }

}
