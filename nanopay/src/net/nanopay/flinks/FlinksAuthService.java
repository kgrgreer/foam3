package net.nanopay.flinks;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.util.SafetyUtil;
import net.nanopay.flinks.model.*;

import java.io.*;
import java.util.*;

import org.apache.commons.io.IOUtils;


/**
 * The FlinksAuthService is used as service that will be delegated into the Skeleton Box.
 * Handle the requests from the front end
 */
public class FlinksAuthService
  extends ContextAwareSupport
  implements FlinksAuth, NanoService
{
  protected DAO userDAO_;
  protected DAO sessionDAO_;
  protected DAO bankAccountDAO_;
  protected DAO institutionDAO_;
  protected DAO flinksAccountsDetailResponseDAO_;
  protected FlinksRestService flinksService = new FlinksRestService();
  protected String sep = System.getProperty("file.separator");
  protected String storeRoot_ = System.getProperty("catalina.home") + sep + "webapps" + sep + "ROOT";

  @Override
  public void start() {
    userDAO_        = (DAO) getX().get("localUserDAO");
    sessionDAO_     = (DAO) getX().get("localSessionDAO");
    bankAccountDAO_ = (DAO) getX().get("accountDAO");
    institutionDAO_ = (DAO) getX().get("institutionDAO");
    flinksAccountsDetailResponseDAO_ = (DAO) getX().get("flinksAccountsDetailResponseDAO");
    flinksService.setX(getX());
  }

  public FlinksResponse authorize(X x, String institution, String username, String password, User currentUser) throws AuthenticationException {
    //TODO: security check
    try {
      ResponseMsg respMsg = null;
      RequestMsg reqMsg = FlinksRequestGenerator.getAuthRequest(getX(), institution, username, password);
      //catch any Exception that happen when connect to Flinks
      try {
        respMsg = flinksService.serve(reqMsg, FlinksRestService.AUTHORIZE);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Authorize]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Flinks");
      }

      int httpCode = respMsg.getHttpStatusCode();
      FlinksResponse feedback;
      if ( httpCode == 200 ) {
        //forward to fetch account
        FlinksAuthResponse resp = (FlinksAuthResponse) respMsg.getModel();
        return getAccountSummary(x, resp.getRequestId(), currentUser, true);
      } else if ( httpCode == 203 ) {
        FlinksMFAResponse resp = (FlinksMFAResponse) respMsg.getModel();
        resp.validate();

        feedback = (FlinksMFAResponse) respMsg.getModel();
        //check if it is image selection
        if ( "ImageSelection".equals(((FlinksMFAResponse) feedback).getSecurityChallenges()[0].getType()) ) {
          decodeMsg((FlinksMFAResponse) feedback);
        }
      } else {
        feedback = (FlinksInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Flinks Authorize: [ HttpStatusCode: " + feedback.getHttpStatusCode() + ", FlinksCode: " + feedback.getFlinksCode() + ", Message: " + feedback.getMessage() + "]");
      }
      return feedback;
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Flinks Authorize: [ " + t.toString() + "].", t);
      throw new AuthenticationException("Bank authorization failed");
    }
  }

  public FlinksResponse challengeQuestion(X x, String institution, String username, String requestId, java.util.Map map1, String type, User currentUser) throws AuthenticationException {
    //TODO: security check
    try {
      ResponseMsg respMsg = null;
      if ( "ImageSelection".equals(type) ) {
        encodeMsg(map1);
      }
      RequestMsg reqMsg = FlinksRequestGenerator.getMFARequest(getX(), institution, username, requestId, map1);
      //catch any Exception that happen when connect to Flinks
      try {
        respMsg = flinksService.serve(reqMsg, FlinksRestService.CHALLENGE);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [MFA]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Flinks");
      }
      FlinksResponse feedback;
      int httpCode = respMsg.getHttpStatusCode();
      if ( httpCode == 200 ) {
        //forward to get account info
        FlinksAuthResponse resp = (FlinksAuthResponse) respMsg.getModel();
        return getAccountSummary(x, resp.getRequestId(), currentUser, true);
      } else if ( httpCode == 203 || httpCode == 401) {
        FlinksMFAResponse resp = (FlinksMFAResponse) respMsg.getModel();
        resp.validate();

        feedback = (FlinksMFAResponse) respMsg.getModel();
        //check if MFA is image(Laurentienne)
        if ( httpCode == 203 &&
             "ImageSelection".equals(((FlinksMFAResponse) feedback).getSecurityChallenges()[0].getType()) ) {
             decodeMsg((FlinksMFAResponse) feedback);
        }
      } else {
        feedback = (FlinksInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Flinks MFA: [ HttpStatusCode: " + feedback.getHttpStatusCode() + ", FlinksCode: " + feedback.getFlinksCode() + ", Message: " + feedback.getMessage() + "]");
      }
      return feedback;
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Flinks MFA: [ " + t.toString() + "].", t);
      throw new AuthenticationException("Bank authorization failed");
    }
  }


  public FlinksResponse getAccountSummary(X x, String requestId, User currentUser, boolean keepOnlyCADAccounts) throws AuthenticationException {
    try {
      RequestMsg reqMsg = FlinksRequestGenerator.getAccountDetailRequest(getX(), requestId);
      ResponseMsg respMsg = null;
      try {
        respMsg = flinksService.serve(reqMsg, FlinksRestService.ACCOUNTS_DETAIL);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Account Detail]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Flinks: " + t.getMessage(), t);
      }
      int httpCode = respMsg.getHttpStatusCode();
      FlinksResponse feedback;
      if ( httpCode == 200 ) {
        //send accounts to the client
        FlinksAccountsDetailResponse resp = (FlinksAccountsDetailResponse) respMsg.getModel();

        if ( keepOnlyCADAccounts ) {
          resp.setAccounts(filterAccounts(resp.getAccounts()));
        }

        // save flinks response
        resp.setUserId(currentUser.getId());
        feedback = (FlinksAccountsDetailResponse) flinksAccountsDetailResponseDAO_.put(resp);
      } else {
        feedback = (FlinksInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Flinks AccountSummary: [ HttpStatusCode: " + feedback.getHttpStatusCode() + ", FlinksCode: " + feedback.getFlinksCode() + ", Message: " + feedback.getMessage() + "]");
      }
      return feedback;
    } catch ( AuthenticationException ae ) {
      throw ae; 
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Flinks AccountSummary: [ " + t.toString() + "]");
      throw new AuthenticationException("UnknownError: " + t.getMessage(), t);
    }
  }

  public FlinksResponse pollAsync(X x, String requestId, User currentUser) throws AuthenticationException {
    try {
      RequestMsg reqMsg = FlinksRequestGenerator.getAccountDetailAsyncRequest(getX(), requestId);
      ResponseMsg respMsg = null;
      try {
        respMsg = flinksService.serve(reqMsg, FlinksRestService.ACCOUNTS_DETAIL);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Poll Async]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Flinks");
      }
      int httpCode = respMsg.getHttpStatusCode();
      FlinksResponse feedback;
      if ( httpCode == 200 ) {
        //send accounts to the client
        FlinksAccountsDetailResponse resp = (FlinksAccountsDetailResponse) respMsg.getModel();

        resp.setAccounts(filterAccounts(resp.getAccounts()));

        // save flinks response
        resp.setUserId(currentUser.getId());
        feedback = (FlinksAccountsDetailResponse) flinksAccountsDetailResponseDAO_.put(resp);
      } else {
        feedback = (FlinksInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Flinks AccountSummary: [ HttpStatusCode: " + feedback.getHttpStatusCode() + ", FlinksCode: " + feedback.getFlinksCode() + ", Message: " + feedback.getMessage() + "]");
      }
      return feedback;
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Flinks AccountSummary: [ " + t.toString() + "]");
      throw new AuthenticationException("UnknownError");
    }
  }

  protected AccountWithDetailModel[] filterAccounts(AccountWithDetailModel[] accounts) {
    AccountWithDetailModel[] filteredAccounts = accounts;
    return Arrays.stream(filteredAccounts).filter(
      account ->
        ! SafetyUtil.isEmpty(account.getTransitNumber()) &&
        account.getCategory().equals("Operations") &&
        account.getCurrency().equals("CAD")
    ).toArray(AccountWithDetailModel[]::new);
  }

  protected void decodeMsg(FlinksMFAResponse response) {
    String relativePath;
    relativePath = "" + new Date().getTime() + "_" + response.getRequestId();
    String[] images = response.getSecurityChallenges()[0].getIterables();
    for ( int i = 0 ; i < images.length ; i++ ) {
      images[i] = storeToFile(relativePath, i + ".jpg", images[i]);
    }
  }

  protected void encodeMsg(Map map) {
    //Should only have one entry
    java.util.Iterator keys = map.keySet().iterator();
    while ( keys.hasNext() ) {
      Object key   = keys.next();
      String[] as = (String[]) map.get(key);
      for ( int i = 0 ; i < as.length ; i++ ) {
        as[i] = fetchFromFile(as[i]);
      }
    }
  }

  //TODO: ? thread issue
  protected String storeToFile(String relativePath, String fileName, String encode) {
    relativePath = "temp" + sep + relativePath;
    String path = storeRoot_ + sep + relativePath;
    File directory = new File(path);
    if ( ! directory.exists() ) {
      directory.mkdirs();
    }
    relativePath =  relativePath + sep + fileName;
    String fileLocation = storeRoot_ + sep + relativePath;
    try {
      byte[] encodeBytes = encode.getBytes("UTF-8");
      byte[] decodeBytes = Base64.getDecoder().decode(encodeBytes);
      File file = new File(fileLocation);
      try(BufferedOutputStream bffout = new BufferedOutputStream(new FileOutputStream(file))) {
    	  bffout.write(decodeBytes);  
      }
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
    //relative path
    return relativePath;
  }
  //TODO: ? thread issue
  protected String fetchFromFile(String path) {
    String filePath = storeRoot_ + sep + path;
    String ret = null;
    try {
      File file = new File(filePath);
      byte fileContent[] = new byte[(int) file.length()];
      try(BufferedInputStream bffin  = new BufferedInputStream(new FileInputStream(file))) {
    	  bffin.read(fileContent);
      }    
      byte[] bytes2 = Base64.getEncoder().encode(fileContent);
      ret = new String(bytes2, "UTF-8");
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
    return ret;
  }
}
