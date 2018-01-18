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
    authRequest.setSave(true);
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
    authRequest.setSave(true);
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
    FlinksAccountSummaryRequest request = new FlinksAccountSummaryRequest();
    request.setRequestId(requestId);
    RequestMsg msg = new RequestMsg(x, request);
    msg.setHttpMethod("POST");
    msg.setRequestInfo("GetAccountsDetail");
    return msg;
  }
}