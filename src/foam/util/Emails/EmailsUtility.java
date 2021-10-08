package foam.util.Emails;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.app.AppConfig;
import foam.nanos.app.SupportConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailConfig;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailPropertyService;
import foam.nanos.session.Session;
import foam.nanos.theme.Theme;
import foam.nanos.theme.Themes;
import foam.util.SafetyUtil;
import java.util.HashMap;
import java.util.Map;

public class EmailsUtility {
  /*
  documentation:
  Purpose of this function/service is to facilitate the population of an email properties and then to actually send the email.
    STEP 1) EXIT CASES && VARIABLE SET UP
    STEP 2) SERVICE CALL: to fill in email properties.
    STEP 3) SERVICE CALL: passing emailMessage through to actual email service.

  Note:
  For email service to work correctly: parameters should be as follows:
  @param x:             Is necessary
  @param user:          Is only necessary to find the right template associated to the group of the user.
                        If null default is * group.
  @param emailMessage:  The obj that gets filled with all the properties that have been passed.
                        eventually becoming the email that is transported out.
  @param templateName:  The template name that is used for this email. It is found and applied based on user.group
  @param templateArgs:  The arguments that are used to fill the template model body.
  */
  public static void sendEmailFromTemplate(X x, User user, EmailMessage emailMessage, String templateName, Map templateArgs) {
    // EXIT CASES && VARIABLE SET UP
    if ( x == null ) return;

    Logger logger = (Logger) x.get("logger");

    if ( emailMessage == null ) {
      if ( SafetyUtil.isEmpty(templateName) ) {
        logger.error("@EmailsUtility: no email message available to be sent");
        return;
      }
      emailMessage = new EmailMessage();
    }

    X userX = x;
    String group = "";
    if ( user != null ) {
      Session session = new Session.Builder(x).setUserId(user.getId()).build();
      userX = session.applyTo(x);
      session.setContext(userX);
      userX.put(Session.class, session);
      Group userGroup = user.findGroup(x);
      group = userGroup.getId();
    }
    AppConfig appConfig = (AppConfig) userX.get("appConfig");
    Theme theme = (Theme) userX.get("theme");
    String spid = theme.getSpid();

    // Add template name to templateArgs, to avoid extra parameter passing
    if ( ! SafetyUtil.isEmpty(templateName) ) {
      if ( templateArgs == null )
        templateArgs = new HashMap<>();

      templateArgs.put("template", templateName);
    }
    if ( ! templateArgs.containsKey("link") ) {
      templateArgs.put("link", appConfig.getUrl());
    }
    if ( ! templateArgs.containsKey("appLink") ) {
      templateArgs.put("link", appConfig.getUrl());
    }

    // SERVICE CALL: to fill in email properties.
    EmailPropertyService cts = (EmailPropertyService) x.get("emailPropertyService");
    try {
      cts.apply(userX, group, emailMessage, templateArgs);
    } catch (Exception e) {
      Alarm alarm = new Alarm("EmailTemplate");
      alarm.setNote(templateName +": " + e.getMessage());
      ((DAO) x.get("alarmDAO")).put(alarm);

      logger.error("Problem with template: " + templateName, e);
      return;
    }

    // SERVICE CALL: passing emailMessage through to actual email service.
    DAO email = ((DAO) x.get("localEmailMessageDAO")).inX(x);
    emailMessage.setStatus(foam.nanos.notification.email.Status.UNSENT);
    email.put(emailMessage);
  }
}
