package net.nanopay.security.csp;

import java.io.IOException;
import javax.servlet.*;
import javax.servlet.http.*;

public class CSPFilter
  implements Filter {

  private FilterConfig config;
  private String csp_ = "default-src 'none'; script-src 'self' 'unsafe-eval'; style-src 'unsafe-inline'; img-src 'self'; connect-src 'self'; child-src 'self'; report-uri service/CSPReportWebAgent;";

  public void init(FilterConfig filterConfig) throws ServletException {
    this.config = filterConfig;
    csp_ = config.getInitParameter("CONTENT_SECURITY_POLICY");
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response,
                       FilterChain chain) throws IOException, ServletException {
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    httpResponse.setHeader("Content-Security-Policy", csp_);

    chain.doFilter(request, response);
  }

  @Override
  public void destroy(){}
}
