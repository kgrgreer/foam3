package net.nanopay.flinks;

import foam.core.X;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class FlinksConnectWebAgent
    implements WebAgent
{
  @Override
  public void execute(X x) {
    HttpServletRequest req = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);
  }
}