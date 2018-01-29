package net.nanopay.fresh;

import foam.core.*;
import net.nanopay.fresh.FreshConfig;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;



public class FreshBook
  implements WebAgent
{
  public void execute(X x)
  {
    HttpServletRequest req = ( HttpServletRequest ) x.get( HttpServletRequest.class );
    HttpServletResponse resp = ( HttpServletResponse ) x.get( HttpServletResponse.class );
    PrintWriter out = ( PrintWriter ) x.get( PrintWriter.class );
    out.println("<HTML>\n" +
      "<HEAD><TITLE>FRESH</TITLE></HEAD>\n" +
      "<H1>YOU MADE IT</H1>\n" +
      "</HTML>");
    FreshConfig config = new FreshConfig();
    config.setCode(req.getHeader("code"));
  }
}