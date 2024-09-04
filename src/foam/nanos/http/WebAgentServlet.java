/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.dao.*;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.ServletException;

@SuppressWarnings("serial")
public class WebAgentServlet
  extends    HttpServlet
  implements ContextAware
{
  protected WebAgent agent_;
  protected X        x_;

  public WebAgentServlet(WebAgent agent) {
    agent_ = agent;
  }

  public X    getX()    { return x_; }
  public void setX(X x) { x_ = x; }

  @Override
  public void service(final HttpServletRequest req, final HttpServletResponse resp)
    throws IOException
  {
    resp.setContentType("text/html");

    agent_.execute(getX()
      .put(HttpServletRequest.class,  req)
      .put(HttpServletResponse.class, resp)
      .putFactory(PrintWriter.class, new XFactory() {
        public Object create(X x) { try { return resp.getWriter(); } catch (IOException e) { return null; } }
      }));
  }
}
