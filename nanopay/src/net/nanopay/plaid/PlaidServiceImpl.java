package net.nanopay.plaid;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.AuthGetRequest;
import com.plaid.client.request.ItemPublicTokenExchangeRequest;
import com.plaid.client.response.Account;
import com.plaid.client.response.AuthGetResponse;
import com.plaid.client.response.ItemPublicTokenExchangeResponse;
import foam.core.X;
import foam.dao.DAO;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.USBankAccount;
import net.nanopay.plaid.model.PlaidToken;
import retrofit2.Response;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class PlaidServiceImpl implements PlaidService {
  @Override
  public String exchangeForAccessToken(X x, Long userId, String publicToken) {
    PlaidClient plaidClient   = getClient();
    DAO         plaidTokenDAO = (DAO) x.get("plaidTokenDAO");



    try {
      Response<ItemPublicTokenExchangeResponse> response =
        plaidClient.service()
        .itemPublicTokenExchange(new ItemPublicTokenExchangeRequest(publicToken))
        .execute();

      ItemPublicTokenExchangeResponse exchangeResponse = response.body();

      plaidTokenDAO.put(
        new PlaidToken.Builder(x)
        .setId          ( userId )
        .setItemId      ( exchangeResponse.getItemId() )
        .setAccessToken ( exchangeResponse.getAccessToken() )
        .build());

    } catch (IOException e) {
      e.printStackTrace();
    }

    return "Hello " + publicToken;
  }

  @Override
  public String auth(X x, Long userId) {
    PlaidClient plaidClient   = getClient();
    DAO         plaidTokenDAO = (DAO) x.get("plaidTokenDAO");
    DAO         accountDAO    = (DAO) x.get("localAccountDAO");
    PlaidToken  token         = (PlaidToken) plaidTokenDAO.find(userId);

    try {
      Response<AuthGetResponse> response = plaidClient.service()
        .authGet(new AuthGetRequest(token.getAccessToken()))
        .execute();

      AuthGetResponse authGetResponse = response.body();
      List<Account> accounts = authGetResponse.getAccounts();
      AuthGetResponse.Numbers numbers = authGetResponse.getNumbers();

      if ( numbers.getACH().size() != 0 ) {
        Map<String, Account> accountMap =
          accounts.stream()
            .collect(Collectors.toMap(Account::getAccountId, account -> account));

        numbers.getACH().stream()
          .forEach(ach -> {

            Account account = accountMap.get(ach.getAccountId());
            accountDAO.put(
              new USBankAccount.Builder(x)
              .setRouting       ( ach.getRouting() )
              .setWireRouting   ( ach.getWireRouting() )
              .setAccountNumber ( ach.getAccount() )
              //.setBalance       ( account.getBalances().getAvailable().longValue() )
              .setName          ( account.getName() )
              .setDenomination  ( account.getBalances().getIsoCurrencyCode() )
              .setOwner         ( userId )
              .setStatus        ( BankAccountStatus.VERIFIED )
              .build());
          });
      }

    } catch (IOException e) {
      e.printStackTrace();
    }

    return null;
  }


  public PlaidClient getClient() {
    return PlaidClient.newBuilder()
      .clientIdAndSecret("5beeee55d4530d0014d4a4bf", "cf5307ecf3718961525d6d1adf21e5")
      .publicKey("9022d4a959ff4d11f5074fa82f7aa0")
      .sandboxBaseUrl()
      .build();
  }

}
