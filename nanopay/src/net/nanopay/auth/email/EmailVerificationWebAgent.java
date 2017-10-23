package net.nanopay.auth.email;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import org.apache.commons.lang3.StringUtils;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;

public class EmailVerificationWebAgent
    implements WebAgent
{
  @Override
  public void execute(X x) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    EmailTokenService emailToken = (EmailTokenService) x.get("emailToken");
    HttpServletRequest request = (HttpServletRequest) x.get(HttpServletRequest.class);
    final PrintWriter out   = (PrintWriter) x.get(PrintWriter.class);

    String token = request.getParameter("token");
    String userId = request.getParameter("userId");

    if ( userId == null || "".equals(userId) ) {
      out.write("Provide user id");
    }

    if ( token == null || "".equals(token) ) {
      out.write("Provide verification token");
    }

    if ( ! StringUtils.isNumeric(userId) ) {
      out.write("User id is not numeric");
    }

    User user = (User) userDAO.find(Long.valueOf(userId, 10));
    if ( user == null ) {
      // TODO: handle error
      out.write("User not found");
      return;
    }

    if ( ! emailToken.processToken(user, token) ) {
      out.write("Failed to verify email");
    } else {
      out.write("email verified");
    }
  }
}