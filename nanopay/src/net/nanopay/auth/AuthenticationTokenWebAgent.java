package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.token.TokenService;
import foam.nanos.dig.DigUtil;
import foam.nanos.dig.exception.DAOPutException;
import foam.nanos.dig.exception.DigErrorMessage;
import foam.nanos.dig.exception.DigSuccessMessage;
import foam.nanos.dig.exception.GeneralException;
import foam.nanos.http.Format;
import foam.nanos.http.WebAgent;
import foam.util.SafetyUtil;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

public class AuthenticationTokenWebAgent implements WebAgent {
  protected static final String SUCCESS = "Success";
  protected static final String FAILURE = "Failed to create authentication token";

  @Override
  public void execute(X x) {
    TokenService tokenService = (TokenService) x.get("authenticationTokenService");
    HttpServletRequest request = x.get(HttpServletRequest.class);
    String callbackUrl = request.getParameter("callbackUrl");
    String userId = request.getParameter("userId");
    String businessId = request.getParameter("businessId");

    DAO localUserDAO = (DAO) x.get("localUserDAO");
    User user = (User) localUserDAO.find(Long.valueOf(userId));

    try {
      if ( user == null ) {
        throw new RuntimeException("User not found");
      }

      Map<String, Object> parameters = new HashMap<>();
      parameters.put("callbackUrl", callbackUrl);
      if ( ! SafetyUtil.isEmpty(businessId) ) {
        parameters.put("businessId", Long.valueOf(businessId));
      }

      boolean success = tokenService.generateTokenWithParameters(x, user, parameters);
      DigErrorMessage error = success
        ? new DigSuccessMessage.Builder(x).setMessage(SUCCESS).build()
        : new DAOPutException.Builder(x).setMessage(FAILURE).build();
      DigUtil.outputException(x, null, Format.JSON, null, error);
    } catch (Exception e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage(e.toString())
        .build();
      DigUtil.outputException(x, null, Format.JSON, null, error);
    }
  }
}
