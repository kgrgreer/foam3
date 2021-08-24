package foam.nanos.fs;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class DownloadAwareWebAgent implements WebAgent {
  protected static final int BUFFER_SIZE = 4096;

  @Override
  public void execute(X x) {
    var logger = (Logger) x.get("logger");
    var req  = x.get(HttpServletRequest.class);
    var resp = x.get(HttpServletResponse.class);

    var file = (File) ((DAO) x.get("fileDAO")).find(req.getParameter("fileId"));
    if ( file != null ) {
      var is = file.download(x);
      if ( is != null ) {
        try {
          int read;
          var buffer = new byte[BUFFER_SIZE];
          while ( (read = is.read(buffer, 0, BUFFER_SIZE)) != -1 ) {
            resp.getOutputStream().write(buffer, 0, read);
          }
          is.close();
        } catch ( IOException e ) {
          logger.error(e);
        }
      }
    }
  }
}
