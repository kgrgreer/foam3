/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.core.X;
import foam.nanos.http.WebAgent;
import foam.nanos.http.Format;
import foam.nanos.http.HttpParameters;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import foam.lib.json.OutputterMode;
import foam.lib.xml.Outputter;

/**
   Report Medusa clusterConfig and replayingInfo.
 */
public class MedusaInfoWebAgent
  implements WebAgent
{
  @Override
  public void execute(X x) {
    PrintWriter         out      = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    HttpParameters      p       = x.get(HttpParameters.class);
    Format              format  = (Format) p.get(Format.class);

    response.setContentType("text/plain");
    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

    if ( support != null ) {
      response.setStatus(HttpServletResponse.SC_OK);
      ClusterConfig config = (ClusterConfig) ((foam.dao.DAO) x.get("clusterConfigDAO")).find(support.getConfigId()).fclone();

      // Monitoring processes rely on these values
      config.setReplayingInfo((ReplayingInfo) x.get("replayingInfo"));

      config.SESSION_ID.clear(config);

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

        outputterJson.output(config);

        // Output the formatted data
        out.println(outputterJson.toString());
      } else { // if( format == Format.XML ) {
        Outputter outputter = new Outputter(out, OutputterMode.NETWORK);
        outputter.setOutputDefaultValues(true);
        out.println(outputter.stringify(config));
      }
    } else {
      response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    }
  }
}
