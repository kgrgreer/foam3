/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.flinks;

import foam.core.*;
import foam.dao.*;
import java.util.*;
import net.nanopay.flinks.model.*;
import foam.nanos.NanoService;
import javax.naming.AuthenticationException;

public class FlinksAuthService
  extends ContextAwareSupport
  implements FlinksAuth, NanoService
{
  protected DAO userDAO_;
  protected DAO sessionDAO_;
  protected DAO bankAccountDAO_;
  protected DAO institutionDAO_;
  protected FlinksRestService flinksService = new FlinksRestService();

  @Override
  public void start() {
    userDAO_        = (DAO) getX().get("localUserDAO");
    sessionDAO_     = (DAO) getX().get("sessionDAO");
    bankAccountDAO_ = (DAO) getX().get("bankAccountDAO");
    institutionDAO_ = (DAO) getX().get("institutionDAO");
    flinksService.setX(getX());
  }

  public FlinksRespMsg authorize(X x, String institution, String username, String password) throws AuthenticationException {
    //TODO: security check
    ResponseMsg respMsg = null;
    RequestMsg reqMsg = FlinksRequestGenerator.getAuthRequest(getX(), institution, username, password);
    
    //catch any Exception that happen when connect to Flinks
    try {
      respMsg = flinksService.serve(reqMsg, FlinksRestService.AUTHORIZE);
    } catch ( Throwable t ) {
      t.printStackTrace();
      throw new AuthenticationException("Exception throw when connect to the Flinks");
    }
    
    int httpCode = respMsg.getHttpStatusCode();
    FlinksRespMsg front = new FlinksRespMsg();

    System.out.println(respMsg.getJson());
    if ( httpCode == 200 ) {
      //TODO: forward to fetch account;
    } else if ( httpCode == 203 ) {
      //forward MFA to the client, might have different kinds of MFA response code, forward to another view to handle different MFA might be better
      FlinksMFAResponse resp = (FlinksMFAResponse) respMsg.getModel();
      //SecurityChallengeModel[] securityChallengeModels = resp.getSecurityChallenges();
      // String[] questions = new String[securityChallengeModels.length];
      // for ( int i = 0 ; i < securityChallengeModels.length ; i++ ) {
      //   questions[i] = securityChallengeModels[i].getPrompt();
      // }
      //front.setQuestions(questions);
      front.setHttpStatus(httpCode);
      front.setSecurityChallenges(resp.getSecurityChallenges());
      front.setRequestId(resp.getRequestId());
    } else {
      //if connect error forward error to the client
      FlinksInvalidResponse resp = (FlinksInvalidResponse) respMsg.getModel();
      // front.setHttpStatus(httpCode);
      // front.setErrorMessage(resp.getMessage());
      throw new AuthenticationException(resp.getMessage());
    }
    return front;
  }

  public FlinksRespMsg challengeQuestion(X x, String institution, String username, String requestId, String[] questions, Object[] answers) throws AuthenticationException {
    //TODO: security check
    Map map = new HashMap<>(questions.length);
    ResponseMsg respMsg = null;
    for ( int i = 0 ; i < questions.length ; i++ ) {
      map.put(questions[i], answers[i]);
    } 
    RequestMsg reqMsg = FlinksRequestGenerator.getMFARequest(getX(), institution, username, requestId, map);
    //catch any Exception that happen when connect to Flinks
    try {
      respMsg = flinksService.serve(reqMsg, FlinksRestService.CHALLENGE);
    } catch ( Throwable t ) {
      t.printStackTrace();
      throw new AuthenticationException("Exception throw when connect to the Flinks");
    }
    
    int httpCode = respMsg.getHttpStatusCode();
    FlinksRespMsg front = new FlinksRespMsg();

    if ( httpCode == 200 ) {
      //forward to get account info
      FlinksAuthResponse resp = (FlinksAuthResponse) respMsg.getModel();
      return getAccountSummary(x, resp.getRequestId());
    } else if ( httpCode == 401 ) {
      FlinksMFAResponse resp = (FlinksMFAResponse) respMsg.getModel();
      front.setHttpStatus(httpCode);
      front.setSecurityChallenges(resp.getSecurityChallenges());
      front.setRequestId(resp.getRequestId());
      front.setErrorMessage(resp.getMessage());
    } else {
      FlinksInvalidResponse resp = (FlinksInvalidResponse) respMsg.getModel();      
      throw new AuthenticationException(resp.getMessage());
    }
    return front; 
  }

  public FlinksRespMsg getAccountSummary(X x, String requestId) throws AuthenticationException {
    RequestMsg reqMsg = FlinksRequestGenerator.getAccountSummaryRequest(getX(), requestId);
    ResponseMsg respMsg = null;
    //catch any Exception that happen when connect to Flinks
    try {
      respMsg = flinksService.serve(reqMsg, FlinksRestService.ACCOUNTS_SUMMARY);
    } catch ( Throwable t ) {
      t.printStackTrace();
      throw new AuthenticationException("Exception throw when connect to the Flinks");
    }

    int httpCode = respMsg.getHttpStatusCode();
    FlinksRespMsg front = new FlinksRespMsg();

    if ( httpCode == 200 ) {
      //send accounts to the client
      FlinksAccountsSummaryResponse resp = (FlinksAccountsSummaryResponse) respMsg.getModel();
      String Institution = resp.getInstitution();
      AccountModel[] accounts = resp.getAccounts();
      int length = accounts.length;
      FlinksAccount[] faccounts = new FlinksAccount[length];
      front.setHttpStatus(httpCode);
      for ( int i = 0 ; i < length ; i++ ) {
        faccounts[i] = new FlinksAccount();
        faccounts[i].setInstitution(Institution);
        faccounts[i].setAccountName(accounts[i].getTitle());
        faccounts[i].setAccountNo(accounts[i].getAccountNumber());
        faccounts[i].setBalance(accounts[i].getBalance().getCurrent());
        faccounts[i].setIsSelected(false);
      }
      front.setAccounts(faccounts);
    } else {
      FlinksInvalidResponse resp = (FlinksInvalidResponse) respMsg.getModel();      
      throw new AuthenticationException(resp.getMessage());
    }
    return front;
  }
}