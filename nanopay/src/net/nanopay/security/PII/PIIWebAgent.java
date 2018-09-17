package net.nanopay.security.PII;

import foam.core.X;
import foam.lib.json.OutputterMode;
import foam.nanos.http.WebAgent;
import jdk.nashorn.api.scripting.JSObject;
import net.nanopay.security.PII.PIIReportGenerator;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletOutputStream;
import net.nanopay.security.PII.PIIReportGenerator;
import foam.nanos.auth.User;


public class PIIWebAgent
    implements WebAgent
{
  public PIIWebAgent() {}

  public synchronized void execute(X x) {
    try {
      HttpServletResponse response = x.get(HttpServletResponse.class);
      
      User user = (User) x.get("user");
      Long userId = user.getId();

      // Generate PII report
      PIIReportGenerator reportGenerator = new PIIReportGenerator();
      String json = (reportGenerator.getPIIData(x, userId)).toString();

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
