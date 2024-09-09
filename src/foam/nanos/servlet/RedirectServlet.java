/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.servlet;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Typically used to alias short paths like "/" or "/merchant" to specific services.
 */
public class RedirectServlet
    extends HttpServlet
{
  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String path = getServletConfig().getInitParameter("path");
    RequestDispatcher view = req.getRequestDispatcher(path);
    view.forward(req, resp);
  }
}
