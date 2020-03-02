/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.plaid;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.SandboxPublicTokenCreateRequest;
import com.plaid.client.request.common.Product;
import com.plaid.client.response.SandboxPublicTokenCreateResponse;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.plaid.config.PlaidCredential;
import net.nanopay.plaid.model.PlaidAccountDetail;
import net.nanopay.plaid.model.PlaidItem;
import net.nanopay.plaid.model.PlaidPublicToken;
import retrofit2.Response;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class PlaidIntegrationTest extends foam.nanos.test.Test {

  Long userId = 999L;
  String institutionId = "ins_109508";
  String institutionName = "First Platypus Bank";

  @Override
  public void runTest(X x) {
    x = x.put("localUserDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x)
              .setAuthorizer(new foam.nanos.auth.AuthorizableAuthorizer(foam.nanos.auth.User.class.getSimpleName().toLowerCase()))
              .setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()))
              .build());

    // 1. User creation
    x = TestUtils.mockDAO(x, "localUserDAO");
    User user =
      new User.Builder(x)
      .setId(999)
      .setFirstName("Testfirst")
      .setLastName("TestLast")
      .setEmail("tester@nanopay.net")
      .setGroup("sme")
      .build();
    ((DAO) x.get("localUserDAO")).put(user);
    X userContext = Auth.sudo(x, user);

    // always use sandbox credential here
    PlaidCredential credential =
      new PlaidCredential.Builder(x)
      .setClientId("5beeee55d4530d0014d4a4bf")
      .setClientName("nanopay")
      .setEnv("sandbox")
      .setPublicKey("9022d4a959ff4d11f5074fa82f7aa0")
      .setSecret("cf5307ecf3718961525d6d1adf21e5")
      .build();

    PlaidService plaidService = new PlaidServiceImpl(credential);

    try {
      PlaidPublicToken publicToken = createPublicTokenForTest(userContext, plaidService);

      PlaidIntegration_ExchangeForAccessToken(userContext, plaidService, publicToken);
      PlaidIntegration_FetchAccountsDetail(userContext, plaidService);


    } catch (IOException e) {
    }
  }

  public void PlaidIntegration_ExchangeForAccessToken(X x, PlaidService plaidService, PlaidPublicToken publicToken) throws IOException {

    plaidService.exchangeForAccessToken(x, publicToken);

    PlaidItem item =
      ( (PlaidServiceImpl) plaidService ).findItemBy(x, userId, institutionId);

    boolean result =
      !SafetyUtil.isEmpty(item.getAccessToken()) &&
      item.getInstitutionId().equals(institutionId);

    test(result, "Exchange for access token");
  }

  public void PlaidIntegration_FetchAccountsDetail(X x, PlaidService plaidService) throws IOException {

    plaidService.fetchAccountsDetail(x, userId, institutionId);



    DAO plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");
    ArraySink select = (ArraySink) plaidAccountDetailDAO.where(
      MLang.AND(
        MLang.EQ(PlaidAccountDetail.USER_ID, userId),
        MLang.EQ(PlaidAccountDetail.INSTITUTION_ID, institutionId)))
      .select(new ArraySink());

    test(
      select.getArray().size() != 0,
      "Fetch plaid account detail"
    );

  }

  /**
   * Please note: we can only use this API in the sandbox
   * @return PlaidPublicToken without selected account
   */
  public PlaidPublicToken createPublicTokenForTest(X x, PlaidService plaidService) throws IOException {
    PlaidClient client = ( (PlaidServiceImpl) plaidService ).getClient(x);

    test(
      ((PlaidServiceImpl) plaidService).credential.getEnv().equals("sandbox"),
      "Ensure the test env is sandbox"
    );

    List<Product> products = new ArrayList<>();
    products.add(Product.AUTH);

    Response<SandboxPublicTokenCreateResponse> createResponse =
      client.service().sandboxPublicTokenCreate(
        new SandboxPublicTokenCreateRequest(institutionId, products)
      ).execute();

    return new PlaidPublicToken.Builder(x)
      .setInstitutionId(institutionId)
      .setInstitutionName(institutionName)
      .setPublicToken(createResponse.body().getPublicToken())
      .setUserId(userId)
      .build();
  }

}
