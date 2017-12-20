package net.nanopay.auth.email;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.notification.email.DAOResourceLoader;
import foam.nanos.notification.email.EmailTemplate;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;
import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;
import org.jtwig.resource.loader.TypedResourceLoader;

public class EmailVerificationWebAgent
    implements WebAgent
{
  protected EnvironmentConfiguration config_;

  @Override
  public void execute(X x) {
    PrintWriter        out              = (PrintWriter) x.get(PrintWriter.class);
    String             message          = "Your email has now been verified.";
    DAO                userDAO          = (DAO) x.get("localUserDAO");
    EmailTokenService  emailToken       = (EmailTokenService) x.get("emailToken");
    HttpServletRequest request          = (HttpServletRequest) x.get(HttpServletRequest.class);
    String             token            = request.getParameter("token");
    String             userId           = request.getParameter("userId");
    User               user             = (User) userDAO.find(Long.valueOf(userId));
    DAO                emailTemplateDAO = (DAO) x.get("emailTemplateDAO");

    try {

      if ( token == null || "".equals(token) ) {
        throw new Exception("Token not found");
      }

      if ( userId == null || "".equals(userId) || ! StringUtils.isNumeric(userId) ) {
        throw new Exception("User not found.");
      }


      if ( user == null ) {
        throw new Exception("User not found.");
      }

      if ( user.getEmailVerified() ) {
        throw new Exception("Email already verified.");
      }

      emailToken.processToken(user, token);
    } catch (Throwable t) {
      message = "Problem verifying your email.<br>" + t.getMessage();
    } finally {
      if ( config_ == null ) {
        config_ = EnvironmentConfigurationBuilder
            .configuration()
            .resources()
            .resourceLoaders()
            .add(new TypedResourceLoader("dao", new DAOResourceLoader(emailTemplateDAO, (Group) user.getGroup())))
            .and().and()
            .build();
      }

      EmailTemplate emailTemplate = (EmailTemplate) emailTemplateDAO.find("verify-email-link");
      JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config_);
      JtwigModel model = JtwigModel.newModel(Collections.<String, Object>singletonMap("msg", message));
      out.write(template.render(model));
    }
  }
}
