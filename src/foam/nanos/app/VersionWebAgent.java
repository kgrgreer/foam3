/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.app;

import foam.core.X;
import foam.nanos.http.WebAgent;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
   Report application version.
 */
public class VersionWebAgent
  implements WebAgent
{
  @Override
  public void execute(X x) {
    PrintWriter          out       = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);

    response.setContentType("text/plain");
    response.setStatus(HttpServletResponse.SC_OK);

    AppConfig app = (AppConfig) x.get("appConfig");
    out.print(app.getVersion());
    out.println("\n");
  }
}
