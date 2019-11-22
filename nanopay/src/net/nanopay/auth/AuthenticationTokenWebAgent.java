package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.lib.AndPropertyPredicate;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.PermissionedPropertyPredicate;
import foam.lib.PropertyPredicate;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import foam.nanos.auth.token.TokenService;
import foam.nanos.dig.exception.DAOPutException;
import foam.nanos.dig.exception.DigErrorMessage;
import foam.nanos.dig.exception.DigSuccessMessage;
import foam.nanos.dig.exception.GeneralException;
import foam.nanos.http.WebAgent;
import foam.util.SafetyUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
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
      outputException(x, null, "JSON", null, error);
    } catch (Exception e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage(e.toString())
        .build();
      outputException(x, null, "JSON", null, error);
    }
  }

  protected void outputException(X x, HttpServletResponse resp, String format, PrintWriter out, DigErrorMessage error) {
    if ( resp == null ) resp = x.get(HttpServletResponse.class);
    if ( out == null ) out = x.get(PrintWriter.class);

    resp.setStatus(Integer.parseInt(error.getStatus()));
    format = "JSON";  // Currently supporting only JSON

    if ( format.equals("JSON") ) {
      resp.setContentType("application/json");

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);

      Outputter outputterJson = new foam.lib.json.Outputter(x)
        .setPropertyPredicate(
          new AndPropertyPredicate(x, new PropertyPredicate[]{
            new NetworkPropertyPredicate(),
            new PermissionedPropertyPredicate()
          })
        );
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.output(error);

      out.println(outputterJson.toString());
    }
  }
}
