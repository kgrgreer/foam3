package net.nanopay.security.csp;

import java.io.IOException;
import javax.servlet.*;
import javax.servlet.http.*;

public class CSPFilter
  implements Filter {

  protected FilterConfig config_;
  protected String csp_;

  public void init(FilterConfig filterConfig) throws ServletException {
    this.config_ = filterConfig;
    csp_ = config_.getInitParameter("CONTENT_SECURITY_POLICY");
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
