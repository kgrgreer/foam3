package net.nanopay.invoice.xero;

import com.xero.api.OAuthAuthorizeToken;
import com.xero.api.OAuthRequestToken;
import foam.core.X;
import foam.nanos.http.WebAgent;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class XeroService
  implements WebAgent {

  public void execute( X x ) {
    try {
      HttpServletResponse resp = ( HttpServletResponse ) x.get( HttpServletResponse.class );
      PrintWriter out = (PrintWriter) x.get(PrintWriter.class);
      XeroConfig config = new XeroConfig();
      TokenStorage store = ( TokenStorage ) x.get( "xeroStorage" );

      // get temporary token and secret
      OAuthRequestToken requestToken = new OAuthRequestToken( config );
      requestToken.execute();
      store.setToken( requestToken.getTempToken() );
      store.setTokenSecret( requestToken.getTempTokenSecret() );

      //Build the Authorization URL and redirect User
      OAuthAuthorizeToken authToken = new OAuthAuthorizeToken( config, requestToken.getTempToken() );
      x.put( "xeroStorage" , store );
      resp.sendRedirect( authToken.getAuthUrl() );

    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }
}