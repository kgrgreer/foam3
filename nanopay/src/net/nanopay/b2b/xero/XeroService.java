package net.nanopay.b2b.xero;

import com.xero.api.OAuthAuthorizeToken;
import com.xero.api.OAuthRequestToken;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class XeroService
  implements WebAgent {

  public void execute(X x) {
    try {
      HttpServletResponse resp = (HttpServletResponse) x.get(HttpServletResponse.class);
      PrintWriter out = (PrintWriter) x.get(PrintWriter.class);
      XeroConfig config = new XeroConfig();
      DAO store = (DAO) x.get("tokenStorageDAO");
      User user = (User) x.get("user");
      TokenStorage tokenStorage;
      System.out.println(user.getId());
      tokenStorage = (TokenStorage) store.find(user.getId());
      if (tokenStorage == null){
        tokenStorage = new TokenStorage();
        tokenStorage.setId(user.getId());
        tokenStorage.setToken(" ");
        tokenStorage.setTokenSecret(" ");
        tokenStorage.setTokenTimestamp("0");
        OAuthRequestToken requestToken = new OAuthRequestToken(config);
        requestToken.execute();
        System.out.println(requestToken.getTempToken() + "    " + requestToken.getTempTokenSecret());
        tokenStorage.setToken(requestToken.getTempToken());
        tokenStorage.setTokenSecret(requestToken.getTempTokenSecret());
        System.out.println(tokenStorage.getToken() + "    " + tokenStorage.getTokenSecret() + " " + tokenStorage.getId());

        //Build the Authorization URL and redirect User
        OAuthAuthorizeToken authToken = new OAuthAuthorizeToken(config, requestToken.getTempToken());
        store.put(tokenStorage);
        resp.sendRedirect(authToken.getAuthUrl());
        System.out.println("CASE 1");
      }
      else{
        if ((1000 * Long.parseLong(tokenStorage.getTokenTimestamp()) + (1000 * 60 * 3)) > System.currentTimeMillis()) {
          System.out.println("I MADE IT TO THIS");
          System.out.println("STRING" + tokenStorage.getTokenTimestamp());
          System.out.println("LONG " + (1000 * Long.parseLong(tokenStorage.getTokenTimestamp())));
          System.out.println("LONG + EXTRA time" + (1000 * Long.parseLong(tokenStorage.getTokenTimestamp()) + (1000 * 60 * 3)));
          System.out.println("RT " + System.currentTimeMillis());

          resp.sendRedirect("/service/xeroComplete");
          System.out.println("CASE 2");

        }
        else{

          OAuthRequestToken requestToken = new OAuthRequestToken(config);
          requestToken.execute();
          System.out.println(requestToken.getTempToken() + "    " + requestToken.getTempTokenSecret());
          tokenStorage.setToken(requestToken.getTempToken());
          tokenStorage.setTokenSecret(requestToken.getTempTokenSecret());
          System.out.println(tokenStorage.getToken() + "    " + tokenStorage.getTokenSecret() + " " + tokenStorage.getId());

          //Build the Authorization URL and redirect User
          OAuthAuthorizeToken authToken = new OAuthAuthorizeToken(config, requestToken.getTempToken());
          store.put(tokenStorage);
          resp.sendRedirect(authToken.getAuthUrl());
          System.out.println("CASE 3");
        }


      }

      } catch (NullPointerException e) {
      System.out.println("FAIL");
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
