package net.nanopay.flinks;

import foam.core.X;
import net.nanopay.flinks.model.*;
import java.util.Map;

public class FlinksRequestGenerator {
  public static RequestMsg getAuthRequest(X x, String institution, String username, String password) {
    FlinksAuthRequest authRequest = new FlinksAuthRequest();
    authRequest.setInstitution(institution);
    authRequest.setUsername(username);
    authRequest.setPassword(password);
    authRequest.setSave(false);
    authRequest.setMostRecentCached(false);
    RequestMsg msg = new RequestMsg(x, authRequest);
    msg.setHttpMethod("POST");
    msg.setRequestInfo("Authorize");
    return msg;
  }

  public static RequestMsg getMFARequest(X x, String institution, String username, String requestId, Map MFA) {
    FlinksAuthRequest authRequest = new FlinksAuthRequest();
    authRequest.setInstitution(institution);
    authRequest.setUsername(username);
    authRequest.setRequestId(requestId);
    authRequest.setSecurityResponses(MFA);
    authRequest.setSave(false);
    authRequest.setMostRecentCached(false);
    RequestMsg msg = new RequestMsg(x, authRequest);
    msg.setHttpMethod("POST");
    msg.setRequestInfo("Authorize");
    return msg;
  }

  public static RequestMsg getAccountSummaryRequest(X x, String requestId) {
    FlinksAccountSummaryRequest request = new FlinksAccountSummaryRequest();
    request.setRequestId(requestId);
    RequestMsg msg = new RequestMsg(x, request);
    msg.setHttpMethod("POST");
    msg.setRequestInfo("GetAccountsSummary");
    return msg;
  }

  public static RequestMsg getAccountDetailRequest(X x, String requestId) {
    FlinksAccountDetailRequest request = new FlinksAccountDetailRequest();
    request.setRequestId(requestId);
    request.setWithTransactions(false);
    request.setWithAccountIdentity(true);
    request.setWithKYC(true);
    RequestMsg msg = new RequestMsg(x, request);
    msg.setHttpMethod("POST");
    msg.setRequestInfo("GetAccountsDetail");
    return msg;
  }

  public static RequestMsg getAccountDetailAsyncRequest(X x, String requestId) {
    FlinksAccountDetailAsyncRequest request = new FlinksAccountDetailAsyncRequest();
    request.setRequestId(requestId);
    RequestMsg msg = new RequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("GetAccountsDetailAsync");
    return msg;
  }
}
