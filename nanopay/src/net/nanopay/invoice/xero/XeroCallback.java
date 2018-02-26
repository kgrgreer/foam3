package net.nanopay.invoice.xero;

import com.xero.api.OAuthAccessToken;
import foam.core.X;
import foam.nanos.http.WebAgent;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class XeroCallback
  implements WebAgent {

  public void execute( X x ) {
    try {
      HttpServletRequest req = ( HttpServletRequest ) x.get( HttpServletRequest.class );
      HttpServletResponse resp = ( HttpServletResponse) x.get( HttpServletResponse.class );
      TokenStorage store = ( TokenStorage ) x.get( "xeroStorage" );
      PrintWriter out = (PrintWriter) x.get(PrintWriter.class);
      XeroConfig config = new XeroConfig();

      // retrieve OAuth verifier code from callback URL param
      String verifier = req.getParameter( "oauth_verifier" );
      // Swap your temp token for 30 oauth token
      OAuthAccessToken accessToken = new OAuthAccessToken( config);
      accessToken.build( verifier, store.getToken(), store.getTokenSecret() ).execute();

      // Check if your Access Token call successful
      if ( ! accessToken.isSuccess() ) {
        //resets tokens
        store.setToken( "" );
        store.setTokenSecret( "" );
        x.put( "xeroStorage", store );
        resp.sendRedirect( "/xeroService" );
      } else {

        //Store access token
        store.setTokenSecret( accessToken.getTokenSecret() );
        store.setToken( accessToken.getToken() );
        x.put( "xeroStorage", store );
        resp.sendRedirect( "/xeroComplete" );
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }
}