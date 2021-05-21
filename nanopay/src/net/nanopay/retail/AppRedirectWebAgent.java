package net.nanopay.retail;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import foam.nanos.notification.email.EmailTemplate;
import foam.nanos.notification.email.EmailTemplateEngine;

import javax.servlet.http.HttpServletResponse;

import static foam.mlang.MLang.EQ;

public class AppRedirectWebAgent
    implements WebAgent
{

  @Override
  public void execute(X x) {
    DAO emailTemplateDAO = (DAO) x.get("localEmailTemplateDAO");
    HttpServletResponse resp = x.get(HttpServletResponse.class);

    try {
      EmailTemplate emailTemplate = (EmailTemplate) emailTemplateDAO.inX(x)
          .find(EQ(EmailTemplate.NAME, "app-redirect"));

      EmailTemplateEngine templateEngine = (EmailTemplateEngine) x.get("templateEngine");
      StringBuilder templateBody = templateEngine.renderTemplate(x, emailTemplate.getBody(), java.util.Collections.emptyMap());
      resp.getWriter().append(templateBody);
    } catch (Throwable ignored) {}
  }
}
