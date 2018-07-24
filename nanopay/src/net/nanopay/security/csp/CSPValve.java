package net.nanopay.security.csp;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;
import org.apache.catalina.connector.Request;
import org.apache.catalina.connector.Response;
import org.apache.catalina.valves.ValveBase;

public class CSPValve extends ValveBase {
  protected String csp_ = "default-src 'none';"
    + "child-src 'self';"
    + "worker-src 'self';"
    + "connect-src 'self' data: blob: filesystem: ws:;"
    + "script-src 'self' 'unsafe-eval';"
    + "style-src 'self' https://fonts.googleapis.com/css https://fonts.googleapis.com/icon data: chrome-extension-resource: 'unsafe-inline';"
    + "font-src 'self' https://fonts.gstatic.com data: chrome-extension-resource:;"
    + "img-src 'self' data: blob: filesystem:;"
    + "media-src * data: blob: filesystem:;"
    + "object-src 'self' data: blob: filesystem:;"
    + "frame-src 'self' data: chrome-extension-resource:;"
    + "report-uri /service/CSPReportWebAgent;";

  @Override
  public void invoke(Request request, Response response) throws IOException, ServletException {
      HttpServletResponse httpResponse = (HttpServletResponse) response;
      httpResponse.setHeader("Content-Security-Policy", csp_);

      getNext().invoke(request, response);
  }
}
