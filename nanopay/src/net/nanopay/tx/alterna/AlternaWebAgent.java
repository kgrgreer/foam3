package net.nanopay.tx.alterna;

import foam.core.X;
import foam.lib.json.OutputterMode;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletResponse;
import java.util.Date;

public class AlternaWebAgent
    implements WebAgent
{
  public AlternaWebAgent() {}

  public synchronized void execute(X x) {
    try {
      HttpServletResponse response = x.get(HttpServletResponse.class);
      final Date now = new Date();
      response.setContentType("text/csv");
      response.setHeader("Content-disposition", "attachment; filename=\"" + CsvUtil.generateFilename(now) + "\"");
      CsvUtil.writeCsvFile(x, response.getWriter(), OutputterMode.STORAGE);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }
}
