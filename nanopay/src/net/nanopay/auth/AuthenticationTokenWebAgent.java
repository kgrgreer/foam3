package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.token.Token;
import foam.nanos.auth.token.TokenService;
import foam.nanos.dig.DigUtil;
import foam.nanos.dig.exception.DAOPutException;
import foam.nanos.dig.exception.DigErrorMessage;
import foam.nanos.dig.exception.GeneralException;
import foam.nanos.http.Format;
import foam.nanos.http.WebAgent;
import foam.util.SafetyUtil;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static foam.mlang.MLang.EQ;

public class AuthenticationTokenWebAgent implements WebAgent {
  protected static final String FAILURE = "Failed to create authentication token";

  @Override
  public void execute(X x) {
    TokenService tokenService = (TokenService) x.get("authenticationTokenService");
    HttpServletRequest request = x.get(HttpServletRequest.class);
    String userId = request.getParameter("userId");
    String businessId = request.getParameter("businessId");
    String callbackUrl = request.getParameter("callbackUrl");

    DAO localUserDAO = (DAO) x.get("localUserDAO");
    User user = (User) localUserDAO.find(Long.valueOf(userId));

    try {
      if ( user == null ) {
        throw new RuntimeException("User not found");
      }

      Map<String, Object> parameters = new HashMap<>();
      if ( ! SafetyUtil.isEmpty(businessId) ) parameters.put("businessId", Long.valueOf(businessId));
      if ( ! SafetyUtil.isEmpty(callbackUrl) ) parameters.put("callbackUrl", callbackUrl);
      String tokenUUID = UUID.randomUUID().toString();
      parameters.put("data", tokenUUID);

      boolean success = tokenService.generateTokenWithParameters(x, user, parameters);
      if ( success ) {
        DAO tokenDAO = (DAO) x.get("localTokenDAO");
        Token token = (Token) tokenDAO.find(EQ(Token.DATA, tokenUUID));
        DigUtil.outputFObject(x, token, Format.JSON);

        return;
      }

      DigUtil.outputException(x, new DAOPutException(FAILURE), Format.JSON);
    } catch (Exception e) {
      DigUtil.outputException(x, new GeneralException(e.toString()), Format.JSON);
    }
  }
}
