package net.nanopay.security.pii;

import foam.core.X;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletOutputStream;
import net.nanopay.security.pii.PIIReportGenerator;


public class PIIWebAgent
    implements WebAgent
{
  public PIIWebAgent() {}

  public synchronized void execute(X x) {
    try {
      HttpServletResponse response = x.get(HttpServletResponse.class);

      User user = ((Subject) x.get("subject")).getUser();
      Long userId = user.getId();

      // Generate PII report
      PIIReportGenerator reportGenerator = new PIIReportGenerator();
      String json = reportGenerator.getPIIData(x, userId);

      // Trigger download of generated PII report
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setHeader("Content-disposition", "attachment; filename=\"PIIData\"");
      ServletOutputStream out = response.getOutputStream();
      out.write(json.getBytes());
      out.flush();

      // Add download time to request
      reportGenerator.addTimeToPIIRequest(x);

    } catch (Throwable t) {
      throw new RuntimeException(t);
    }

  }
}
