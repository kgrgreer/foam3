package net.nanopay.business;

import static foam.mlang.MLang.EQ;

import java.io.PrintWriter;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.auth.token.Token;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.DAOResourceLoader;
import foam.nanos.notification.email.EmailTemplate;
import foam.nanos.notification.email.EmailTemplateEngine;
import net.nanopay.model.Business;
import net.nanopay.onboarding.CreateOnboardingCloneService;

/**
 * When an existing user is invited to join another business, they can click a
 * link in the email they get that brings them to this service. Then this
 * service will handle adding that user to the business.
 */
public class JoinBusinessWebAgent implements WebAgent {

  @Override
  public void execute(X x) {
    String message;
    PrintWriter out = x.get(PrintWriter.class);
    JoinBusinessTokenService tokenService = (JoinBusinessTokenService) x.get("joinBusinessToken");
    HttpServletRequest request = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    String tokenUUID = request.getParameter("token");
    String redirect = request.getParameter("redirect");
    User user = null;

    try {
      // Look up the token.
      if ( tokenUUID == null || "".equals(tokenUUID) ) throw new Exception("Token not found.");
      DAO tokenDAO = (DAO) x.get("localTokenDAO");
      Token token = (Token) tokenDAO.find(EQ(Token.DATA, tokenUUID));
      if ( token == null ) throw new Exception("Token not found.");

      // Look up the Business that the User is joining.
      Map<String, Object> parameters = token.getParameters();
      long businessId = (long) parameters.get("businessId");
      DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
      Business business = (Business) localBusinessDAO.inX(x).find(businessId);
      message = "You've been successfully added to " + business.toSummary();
      // Look up the user.
      if ( token.getUserId() == 0 ) throw new Exception("User not found.");
      DAO localUserDAO = (DAO) x.get("localUserDAO");
      user = (User) localUserDAO.inX(x).find(token.getUserId());
      if ( user == null ) throw new Exception("User not found.");

      // Check if the user has already joined the business.
      DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
      UserUserJunction dummy = new UserUserJunction.Builder(x)
        .setSourceId(token.getUserId())
        .setTargetId(businessId)
        .build();
      UserUserJunction junction = (UserUserJunction) agentJunctionDAO.inX(x).find(dummy);
      if ( junction != null ) throw new Exception("User has already been added to that business.");

      // Process the token.
      tokenService.processToken(x, user, tokenUUID);

      CreateOnboardingCloneService createOnboardingCloneService = new CreateOnboardingCloneService(x);
      List<Object> onboardings = createOnboardingCloneService.getSourceOnboarding(businessId);

      if ( onboardings.size() > 0 )
        createOnboardingCloneService.putOnboardingClone(x, onboardings, token.getUserId());
    } catch (Throwable t) {
      message = "There was a problem adding you to the business.<br>" + t.getMessage();
    }

    if ( user == null ) throw new RuntimeException("User not found.");

    Group group = user.findGroup(x);
    AppConfig appConfig = group.getAppConfig(x);
    String url = appConfig.getUrl().replaceAll("/$", "");

    // Encoding business name and email to handle special characters.
    String encodedBusinessName, encodedEmail;
    try {
      encodedEmail =  URLEncoder.encode(user.getEmail(), "UTF-8");
    } catch(Exception e) {
      throw new RuntimeException(e);
    }

    if ( redirect.equals("/") ) redirect = url + "?email=" + encodedEmail;

    EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(
      x,
      "join-business-splash-page",
      user.getGroup(),
      user.getLanguage().getCode().toString()
    );
    EmailTemplateEngine templateEngine = (EmailTemplateEngine) x.get("templateEngine");
    HashMap args = new HashMap();
    args.put("msg", message);
    StringBuilder templateBody = templateEngine.renderTemplate(x, emailTemplate.getBody(), args);
    out.append(templateBody);

    if ( ! redirect.equals("null") ) {
      try {
        response.addHeader("REFRESH", "2;URL=" + redirect);
      } catch (Exception e) {
        Logger logger = (Logger) x.get("logger");
        logger.log(e);
      }
    }
  }
}
