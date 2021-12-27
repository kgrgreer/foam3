/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.app;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import foam.nanos.http.Format;
import foam.nanos.http.HttpParameters;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import foam.lib.json.OutputterMode;
import foam.lib.xml.Outputter;

/**
   Report most current Health
 */
public class HealthWebAgent
  implements WebAgent
{
  @Override
  public void execute(X x) {
    PrintWriter         out      = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    HttpParameters      p       = x.get(HttpParameters.class);
    Format              format  = (Format) p.get(Format.class);

    response.setContentType("text/plain");

    Health health = (Health) ((DAO) x.get("healthDAO")).find_(x, new Health().getId());

    if ( health.getStatus() == HealthStatus.UP ) {
      response.setStatus(HttpServletResponse.SC_OK);
    } else {
      response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    }

    if ( format == Format.JSON ) {
      foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(x)
        .setPropertyPredicate(
                              new foam.lib.AndPropertyPredicate(x,
                                                                new foam.lib.PropertyPredicate[] {
                                                                  new foam.lib.ExternalPropertyPredicate(),
                                                                  new foam.lib.NetworkPropertyPredicate(),
                                                                  new foam.lib.PermissionedPropertyPredicate()}));

      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.setMultiLine(true);

      outputterJson.output(health);

      response.setContentType("application/json");
      out.println(outputterJson.toString());
    } else {
      response.setContentType("text/plain");
      out.println(health.getStatus().getLabel());
    }
  }
}
