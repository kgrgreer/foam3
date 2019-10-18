package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.util.SafetyUtil;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

public class AuthTokenServiceWebAgent implements WebAgent {
  @Override
  public void execute(X x) {
    PrintWriter out = x.get(PrintWriter.class);
    AuthTokenService tokenService = (AuthTokenService) x.get("authTokenService");
    HttpServletRequest request = x.get(HttpServletRequest.class);
    String callbackUrl = request.getParameter("callbackUrl");
    String userId = request.getParameter("userId");
    String businessId = request.getParameter("businessId");
    Boolean result = false;

    DAO localUserDAO = (DAO) x.get("localUserDAO");
    User user = (User) localUserDAO.find(Long.valueOf(userId));

    try {
      if (user == null) {
        throw new RuntimeException("User not found");
      }

      Map<String, Object> parameters = new HashMap<>();
      parameters.put("callbackUrl", callbackUrl);
      if (!SafetyUtil.isEmpty(businessId)) {
        parameters.put("businessId", Long.valueOf(businessId));
      }
      result = tokenService.generateTokenWithParameters(x, user, parameters);
    } finally {
      out.print(result);
    }
  }
}
