package net.nanopay.plaid;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.AuthGetRequest;
import com.plaid.client.request.ItemPublicTokenExchangeRequest;
import com.plaid.client.response.Account;
import com.plaid.client.response.AuthGetResponse;
import com.plaid.client.response.ItemPublicTokenExchangeResponse;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.USBankAccount;
import net.nanopay.plaid.decorators.PrevenDuplicatePlaidAccountDAO;
import net.nanopay.plaid.model.*;
import retrofit2.Response;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class PlaidServiceImpl implements PlaidService {
  @Override
  public String exchangeForAccessToken(X x, PlaidPublicToken publicToken) throws IOException {
    PlaidClient plaidClient = getClient();
    DAO plaidAccessTokenDAO = (DAO) x.get("plaidAccessTokenDAO");

    Response<ItemPublicTokenExchangeResponse> response =
      plaidClient.service()
        .itemPublicTokenExchange(new ItemPublicTokenExchangeRequest(publicToken.getPublicToken()))
        .execute();

    if (response.code() != 200) {
      throw new RuntimeException(response.errorBody().string());
    }

    ItemPublicTokenExchangeResponse exchangeResponse = response.body();

    plaidAccessTokenDAO.put(
      new PlaidAccessToken.Builder(x)
        .setUserId(publicToken.getUserId())
        .setInstitutionId(publicToken.getInstitutionId())
        .setInstitutionName(publicToken.getInstitutionName())
        .setSelectedAccount(publicToken.getSelectedAccount())
        .setItemId(exchangeResponse.getItemId())
        .setAccessToken(exchangeResponse.getAccessToken())
        .build());

    return publicToken.getInstitutionId();
  }

  @Override
  public String fetchAccountsDetail(X x, Long userId, String plaidInstitutionId) throws IOException {
    PlaidClient plaidClient = getClient();
    PlaidAccessToken
      accessToken = findAccessTokenBy(x, userId, plaidInstitutionId);
    DAO plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");

    Response<AuthGetResponse> response = plaidClient.service()
      .authGet(new AuthGetRequest(accessToken.getAccessToken()))
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
            .setAccount(ACHs.get(accountId).getAccount())
            .setRouting(ACHs.get(accountId).getRouting())
            .setWireRouting(ACHs.get(accountId).getWireRouting())
            .build();
        }

        if (EFTs.containsKey(accountId)) {
          eft = new EFT.Builder(x)
            .setAccount(EFTs.get(accountId).getAccount())
            .setBranch(EFTs.get(accountId).getBranch())
            .setInstitution(EFTs.get(accountId).getInstitution())
            .build();
        }


        Account.Balances temp = account.getBalances();
        PlaidBalances balances =
          new PlaidBalances.Builder(x)
            .setAvailable(temp.getAvailable() != null ? temp.getAvailable() : -1.0)
            .setCurrent(temp.getCurrent() != null ? temp.getCurrent() : -1.0)
            .setLimit(temp.getLimit() != null ? temp.getLimit() : -1.0)
            .setIsoCurrencyCode(account.getBalances().getIsoCurrencyCode())
            .build();

        return new PlaidAccountDetail.Builder(x)
          .setUserId(userId)
          .setItemId(accessToken.getItemId())
          .setInstitutionId(accessToken.getInstitutionId())
          .setInstitutionName(accessToken.getInstitutionName())
          .setAccountId(account.getAccountId())
          .setMask(account.getMask())
          .setName(account.getName())
          .setOfficialName(account.getOfficialName())
          .setType(account.getType())
          .setType(account.getSubtype())
          .setACH(ach)
          .setEFT(eft)
          .setBalance(balances)
          .build();
      })
      .forEach(plaidAccountDetailDAO::put);

    return null;
  }

  @Override
  public String importSelectedAccountToSystem(X x, Long userId, String plaidInstitutionId, Map selectedAccount) {
    DAO plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");
    DAO accountDAO = (DAO) x.get("localAccountDAO");

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

      if (accountDetail.getEFT() != null) {
        //TODO Should we store this to CA Bank Account
      }

      if (accountDetail.getACH() != null) {
        accountDAO.put(
          new USBankAccount.Builder(x)
            .setRouting(accountDetail.getACH().getRouting())
            .setWireRouting(accountDetail.getACH().getWireRouting())
            .setAccountNumber(accountDetail.getACH().getAccount())
            .setName(accountDetail.getName())
            .setDenomination(accountDetail.getBalance().getIsoCurrencyCode())
            .setOwner(userId)
            .setStatus(BankAccountStatus.VERIFIED)
            .build());
      }
    }

    return null;
  }


  public PlaidAccessToken findAccessTokenBy(X x, Long userId, String plaidInstitutionId) {
    DAO plaidAccessTokenDAO = (DAO) x.get("plaidAccessTokenDAO");

    ArraySink select = (ArraySink) plaidAccessTokenDAO.where(
      MLang.AND(
        MLang.EQ(PlaidAccessToken.USER_ID, userId),
        MLang.EQ(PlaidAccessToken.INSTITUTION_ID, plaidInstitutionId)))
      .select(new ArraySink());

    if (select.getArray().size() != 1) {
      throw new RuntimeException("No access token or multiple access token");
    }

    return (PlaidAccessToken) select.getArray().get(0);
  }


  public PlaidClient getClient() {
    return PlaidClient.newBuilder()
      .clientIdAndSecret("5beeee55d4530d0014d4a4bf", "cf5307ecf3718961525d6d1adf21e5")
      .publicKey("9022d4a959ff4d11f5074fa82f7aa0")
      .sandboxBaseUrl()
      .build();
  }

}
