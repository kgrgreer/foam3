package net.nanopay.security.PII;

import foam.core.X;
import foam.lib.json.OutputterMode;
import foam.nanos.http.WebAgent;
import jdk.nashorn.api.scripting.JSObject;
import net.nanopay.security.PII.PIIReportGenerator;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletOutputStream;



public class PIIWebAgent
    implements WebAgent
{
  public PIIWebAgent() {}

  public synchronized void execute(X x) {
    try {
      HttpServletResponse response = x.get(HttpServletResponse.class);
      PIIReportGenerator pi = new PIIReportGenerator();
      // TODO pass user id as argument
      String json = (pi.getPIIData(x, 1l)).toString();

      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      // TODO: improve filename
      response.setHeader("Content-disposition", "attachment; filename=\"pii\"");
      ServletOutputStream out = response.getOutputStream();
      
     out.write(json.getBytes());
     out.flush();

    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }
}
