package net.nanopay.plaid;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.AuthGetRequest;
import com.plaid.client.request.ItemPublicTokenExchangeRequest;
import com.plaid.client.request.ItemRemoveRequest;
import com.plaid.client.response.Account;
import com.plaid.client.response.AuthGetResponse;
import com.plaid.client.response.ItemPublicTokenExchangeResponse;
import com.plaid.client.response.ItemRemoveResponse;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.USBankAccount;
import net.nanopay.payment.Institution;
import net.nanopay.plaid.decorators.PrevenDuplicatePlaidAccountDAO;
import net.nanopay.plaid.model.*;
import retrofit2.Response;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class PlaidServiceImpl implements PlaidService {

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
  public Boolean startIntegration(X x, PlaidPublicToken publicToken) throws IOException {
    Long   userId          = publicToken.getUserId();
    String institutionId   = publicToken.getInstitutionId();
    Map    selectedAccount = publicToken.getSelectedAccount();

    exchangeForAccessToken        (x, publicToken);
    fetchAccountsDetail           (x, userId, institutionId);
    importSelectedAccountToSystem (x, userId, institutionId, selectedAccount);

    return true;
  }


  /**
   * Exchange the public token for an API access token,
   * @see {<a href="https://plaid.com/docs/#exchange-token-flow">Exchange token flow</a>}
   *
   * We will save the plaid item and associated access token into plaidItemDAO
   */
  @Override
  public String exchangeForAccessToken(X x, PlaidPublicToken publicToken) throws IOException {
    PlaidClient plaidClient  = getClient();
    DAO         plaidItemDAO = (DAO) x.get("plaidItemDAO");

    Response<ItemPublicTokenExchangeResponse> response =
      plaidClient.service()
        .itemPublicTokenExchange(new ItemPublicTokenExchangeRequest(publicToken.getPublicToken()))
        .execute();

    if (response.code() != 200) {
      throw new RuntimeException(response.errorBody().string());
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
      removeItemFromPlaidServer(plaidItem);
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
  public Boolean fetchAccountsDetail(X x, Long userId, String plaidInstitutionId) throws IOException {
    PlaidClient plaidClient           = getClient();
    PlaidItem
                plaidItem             = findItemBy(x, userId, plaidInstitutionId);
    DAO         plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");

    Response<AuthGetResponse> response = plaidClient.service()
      .authGet(new AuthGetRequest(plaidItem.getAccessToken()))
      .execute();

    if (response.code() != 200) {
      throw new RuntimeException(response.errorBody().string());
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

    return null;
  }


  /**
   *
   * @param selectedAccount Selected account from public token.
   *                        Key is the account mask, value is account name
   */
  @Override
  public Boolean importSelectedAccountToSystem(X x, Long userId, String plaidInstitutionId, Map selectedAccount) {
    DAO plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");
    DAO accountDAO            = (DAO) x.get("localAccountDAO");

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

    for (PlaidAccountDetail accountDetail : accountDetails) {

      Institution institution =
        findInstitutionByName(x, accountDetail.getInstitutionName());

      if (accountDetail.getEFT() != null) {
        //TODO Should we store this to CA Bank Account
      }

      if (accountDetail.getACH() != null) {
        accountDAO.put(
          new USBankAccount.Builder(x)
            .setBranchId      (accountDetail.getACH().getRouting())
            .setWireRouting   (accountDetail.getACH().getWireRouting())
            .setAccountNumber (accountDetail.getACH().getAccount())
            .setName          (accountDetail.getName())
            .setDenomination  (accountDetail.getBalance().getIsoCurrencyCode())
            .setOwner         (userId)
            .setStatus        (BankAccountStatus.VERIFIED)
            .setCountry       ("US")
            .setInstitution   (institution.getId())
            .build());
      }
    }

    return true;
  }

  public boolean removeItemFromPlaidServer(PlaidItem plaidItem) throws IOException {
    PlaidClient client = getClient();

    Response<ItemRemoveResponse> response = client.service().itemRemove(
      new ItemRemoveRequest(plaidItem.getAccessToken())
    ).execute();

    if ( response.code() != 200 ) {
      throw new RuntimeException("Error when deleting item");
    }

    return response.body().getRemoved();
  }

  public boolean isDuplicateItem(X x, PlaidItem plaidItem) throws IOException {
    DAO plaidItemDAO = (DAO) x.get("plaidItemDAO");

    ArraySink select = (ArraySink) plaidItemDAO.where(
      MLang.AND(
        MLang.EQ(PlaidItem.USER_ID, plaidItem.getUserId()),
        MLang.EQ(PlaidItem.INSTITUTION_ID, plaidItem.getInstitutionId())
      )
    ).select(new ArraySink());

    return select.getArray().size() == 1;
  }

  public Institution findInstitutionByName(X x, String name) {
    DAO institutionDAO = (DAO) x.get("institutionDAO");

    ArraySink select = (ArraySink) institutionDAO.where(
      MLang.EQ(Institution.NAME, name)
    ).limit(1).select(new ArraySink());

    Institution institution = null;
    if ( select.getArray().size() == 0 ) {
      institution = (Institution) institutionDAO.put(
        new Institution.Builder(x)
        .setName(name)
        .setCountryId("US")
        .build()
      );
    } else {
      institution = (Institution) select.getArray().get(0);
    }

    return institution;
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

  public PlaidClient getClient() {
    return PlaidClient.newBuilder()
      .clientIdAndSecret("5beeee55d4530d0014d4a4bf", "cf5307ecf3718961525d6d1adf21e5")
      .publicKey("9022d4a959ff4d11f5074fa82f7aa0")
      .sandboxBaseUrl()
      .build();
  }

}
