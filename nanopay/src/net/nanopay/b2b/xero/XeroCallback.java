package net.nanopay.b2b.xero;

import com.xero.api.OAuthAccessToken;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
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
      DAO store = ( DAO ) x.get( "tokenStorageDAO" );
      User user = (User) x.get("user");
      TokenStorage  tokenStorage = (TokenStorage) store.find(user.getId());
      PrintWriter out = (PrintWriter) x.get(PrintWriter.class);
      XeroConfig config = new XeroConfig();

      // retrieve OAuth verifier code from callback URL param
      String verifier = req.getParameter( "oauth_verifier" );
      // Swap your temp token for 30 oauth token
      OAuthAccessToken accessToken = new OAuthAccessToken( config);
      accessToken.build( verifier, tokenStorage.getToken(), tokenStorage.getTokenSecret() ).execute();
      System.out.println(accessToken.getTokenTimestamp());
      // Check if your Access Token call successful
      if ( ! accessToken.isSuccess() ) {
        //Resets tokens
        tokenStorage.setToken( "" );
        tokenStorage.setTokenSecret( "" );
        tokenStorage.setTokenTimestamp("0");
        store.put( tokenStorage );
        resp.sendRedirect( "/service/xeroService" );
      } else {
        //Store access token
        tokenStorage.setTokenSecret( accessToken.getTokenSecret() );
        tokenStorage.setToken( accessToken.getToken() );
        tokenStorage.setTokenTimestamp( accessToken.getTokenTimestamp() );
        store.put( tokenStorage );
        System.out.println("THIS IS HOW IT IS" + accessToken.getTokenTimestamp());
        resp.sendRedirect( "/service/xeroComplete" );
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }
}
