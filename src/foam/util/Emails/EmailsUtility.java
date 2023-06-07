package foam.util.Emails;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.SafetyUtil;
import java.util.HashMap;
import java.util.Map;

/**
 * @Deprecated use emailMessageDAO directly
 */
public class EmailsUtility {

  /**
   * @Deprecated use emailMessageDAO directly
   */
  public static EmailMessage sendEmailFromTemplate(X x, User user, EmailMessage emailMessage, String templateName, Map templateArgs) {

    if ( x == null ) throw new RuntimeException("Context not found");

    Logger logger = (Logger) x.get("logger");
    logger.debug("EmailsUtility deprecated, use emailMessageDAO directly");

    if ( SafetyUtil.isEmpty(templateName) &&
         templateArgs != null ) {
      templateName = (String) templateArgs.get("template");
    }
    if ( emailMessage == null ) {
      if ( SafetyUtil.isEmpty(templateName) ) {
        logger.warning("Both EmailMessage and Template undefined");
        throw new RuntimeException("Both EmailMessage and Template undefined");
      }
      emailMessage = new EmailMessage();
    }
    if ( user != null &&
         emailMessage.getUser() == 0L ) {
      emailMessage.setUser(user.getId());
    }
    Map args = emailMessage.getTemplateArguments();
    if ( args == null ||
         args.size() == 0 ) {
      if ( templateArgs == null ) {
        args = new HashMap<String, Object>();
      } else {
        args = templateArgs;
      }
      emailMessage.setTemplateArguments(args);
    }

    if ( args.get("template") == null &&
         ! SafetyUtil.isEmpty(templateName) ) {
      args.put("template", templateName);
    }

    DAO emailDAO = ((DAO) x.get("emailMessageDAO"));
    return (EmailMessage) emailDAO.put(emailMessage);
  }
}
