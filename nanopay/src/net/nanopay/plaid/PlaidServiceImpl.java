package net.nanopay.plaid;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.ItemPublicTokenExchangeRequest;
import com.plaid.client.response.ItemPublicTokenExchangeResponse;
import foam.core.X;
import retrofit2.Response;

import java.io.IOException;

public class PlaidServiceImpl implements PlaidService {
  @Override
  public String exchangeForAccessToken(X x, String publicToken) {

    PlaidClient plaidClient = getClient();

    try {
      Response<ItemPublicTokenExchangeResponse> response = plaidClient.service()
        .itemPublicTokenExchange(new ItemPublicTokenExchangeRequest(publicToken))
        .execute();



    } catch (IOException e) {
      e.printStackTrace();
    }

    return "Hello " + publicToken;
  }


  public PlaidClient getClient() {
    return PlaidClient.newBuilder()
      .clientIdAndSecret("5beeee55d4530d0014d4a4bf", "cf5307ecf3718961525d6d1adf21e5")
      .publicKey("9022d4a959ff4d11f5074fa82f7aa0")
      .sandboxBaseUrl()
      .build();
  }

}
