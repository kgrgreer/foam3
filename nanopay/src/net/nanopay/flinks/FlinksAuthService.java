package net.nanopay.flinks;

import foam.core.*;
import foam.dao.*;
import java.util.*;
import net.nanopay.flinks.model.*;
import foam.nanos.NanoService;
import javax.naming.AuthenticationException;
import org.apache.commons.io.IOUtils;
import java.util.Base64;
import java.util.Date;
import java.io.*;

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

  public FlinksResponse authorize(X x, String institution, String username, String password) throws AuthenticationException {
    //TODO: security check
    ResponseMsg respMsg = null;
    RequestMsg reqMsg = FlinksRequestGenerator.getAuthRequest(getX(), institution, username, password);
    //System.out.println(reqMsg.getJson());
    //catch any Exception that happen when connect to Flinks
    try {
      respMsg = flinksService.serve(reqMsg, FlinksRestService.AUTHORIZE);
    } catch ( Throwable t ) {
      t.printStackTrace();
      throw new AuthenticationException("Exception throw when connect to the Flinks");
    }
    
    int httpCode = respMsg.getHttpStatusCode();
    FlinksResponse feedback;
    //System.out.println(respMsg.getJson());
    if ( httpCode == 200 ) {
      //TODO: forward to fetch account;
      feedback = null;
    } else if ( httpCode == 203 ) {
      FlinksMFAResponse resp = (FlinksMFAResponse) respMsg.getModel();
      feedback = (FlinksMFAResponse) respMsg.getModel();
    } else {
      feedback = (FlinksInvalidResponse) respMsg.getModel();
      throw new AuthenticationException(feedback.getMessage());
    }
    return feedback;
  }

  public FlinksResponse challengeQuestion(X x, String institution, String username, String requestId, java.util.Map map1) throws AuthenticationException {
    //TODO: security check
    // Map map = new HashMap<>(questions.length);
    ResponseMsg respMsg = null;
    // for ( int i = 0 ; i < questions.length ; i++ ) {
    //   map.put(questions[i], answers[i]);
    // } 
    RequestMsg reqMsg = FlinksRequestGenerator.getMFARequest(getX(), institution, username, requestId, map1);
    System.out.println(reqMsg.getJson());
    //catch any Exception that happen when connect to Flinks
    try {
      respMsg = flinksService.serve(reqMsg, FlinksRestService.CHALLENGE);
    } catch ( Throwable t ) {
      t.printStackTrace();
      throw new AuthenticationException("Exception throw when connect to the Flinks");
    }
    
    FlinksResponse feedback;
    int httpCode = respMsg.getHttpStatusCode();

    if ( httpCode == 200 ) {
      //forward to get account info
      FlinksAuthResponse resp = (FlinksAuthResponse) respMsg.getModel();
      return getAccountSummary(x, resp.getRequestId());
    } else if ( httpCode == 203 ) {
      FlinksMFAResponse resp = (FlinksMFAResponse) respMsg.getModel();
      feedback = (FlinksMFAResponse) respMsg.getModel();
      //check if MFA is image(Laurentienne)
      if ( resp.getSecurityChallenges()[0].getType().equals("ImageSelection") ) {
        String relativePath = resp.getRequestId();
        String[] images = resp.getSecurityChallenges()[0].getIterables();
        for ( int i = 0 ; i < images.length ; i++ ) {
          images[i] = storeToFile(relativePath, i + ".jpg", images[i]);
        }
      }
    } else if ( httpCode == 401 ) {
      FlinksMFAResponse resp = (FlinksMFAResponse) respMsg.getModel();
      feedback = (FlinksMFAResponse) respMsg.getModel();
    } else {     
      feedback = (FlinksInvalidResponse) respMsg.getModel();      
      throw new AuthenticationException(feedback.getMessage());
    }
    return feedback; 
  }

  public FlinksResponse getAccountSummary(X x, String requestId) throws AuthenticationException {
    RequestMsg reqMsg = FlinksRequestGenerator.getAccountSummaryRequest(getX(), requestId);
    ResponseMsg respMsg = null;
    //catch any Exception that happen when connect to Flinks
    try {
      respMsg = flinksService.serve(reqMsg, FlinksRestService.ACCOUNTS_SUMMARY);
      System.out.println(respMsg.getJson());
    } catch ( Throwable t ) {
      t.printStackTrace();
      throw new AuthenticationException("Exception throw when connect to the Flinks");
    }

    int httpCode = respMsg.getHttpStatusCode();
    FlinksRespMsg front = new FlinksRespMsg();
    FlinksResponse feedback;
    if ( httpCode == 200 ) {
      //send accounts to the client
      FlinksAccountsSummaryResponse resp = (FlinksAccountsSummaryResponse) respMsg.getModel();
      feedback = (FlinksAccountsSummaryResponse) respMsg.getModel();
    } else {
      feedback = (FlinksInvalidResponse) respMsg.getModel();      
      throw new AuthenticationException(feedback.getMessage());
    }
    return feedback;
  }

  //TODO: ? thread issue
  protected String storeToFile(String relativePath, String fileName, String encode) {
    String cwd = System.getProperty("user.dir");
    String path = cwd + File.separator + relativePath;
    File directory = new File(path);
    if ( ! directory.exists() ) {
      directory.mkdirs();
    }
    BufferedOutputStream bffout = null;
    String fileLocation = directory + File.separator + fileName;
    try {
      byte[] encodeBytes = encode.getBytes("UTF-8");
      byte[] decodeBytes = Base64.getDecoder().decode(encodeBytes);
      File file = new File(fileLocation);
      bffout = new BufferedOutputStream(new FileOutputStream(file));
      bffout.write(decodeBytes);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(bffout);
    }

    return fileLocation;
  }
  //TODO: ? thread issue
  protected String fetchFromFIle(String path) {
    BufferedInputStream bffin = null;
    String ret = null;
    try {
      File file = new File(path);
      byte fileContent[] = new byte[(int) file.length()];
      bffin = new BufferedInputStream(new FileInputStream(path));
      bffin.read(fileContent);
      byte[] bytes2 = Base64.getEncoder().encode(fileContent);
      ret = new String(bytes2, "UTF-8");
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(bffin);
    }
    return ret;
  }
}