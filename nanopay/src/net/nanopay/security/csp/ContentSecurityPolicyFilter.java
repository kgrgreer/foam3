package net.nanopay.security.csp;

import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ContentSecurityPolicyFilter
  implements Filter
{
  private String csp_ = "default-src 'none'; script-src http://localhost:*; style-src http://localhost:*; img-src http://localhost:*; connect-src http://localhost:*; child-src 'self'; report-uri service/CSPReportWebAgent;";

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    HttpServletResponse resp = (HttpServletResponse) response;
    resp.addHeader("Content-Security-Policy", csp_);
    chain.doFilter(request, response);
  }

  @Override
  public void destroy() {

  }
}
