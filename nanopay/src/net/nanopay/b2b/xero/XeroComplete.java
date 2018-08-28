package net.nanopay.b2b.xero;

import com.xero.api.XeroClient;

import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.PrintWriter;

public class XeroComplete
  implements WebAgent {

  XeroClient client_;

  public void execute( X x ) {

    try {
      HttpServletRequest req = ( HttpServletRequest ) x.get( HttpServletRequest.class );
      HttpServletResponse resp = ( HttpServletResponse ) x.get( HttpServletResponse.class );
      PrintWriter out = ( PrintWriter ) x.get( PrintWriter.class );
      DAO store = ( DAO ) x.get( "tokenStorageDAO" );
      User user = (User) x.get("user");
      TokenStorage  tokenStorage = (TokenStorage) store.find(user.getId());
      XeroConfig config = new XeroConfig();
      DAO invoiceDAO = (DAO) x.get("invoiceDAO");
      client_ = new XeroClient( config);

      client_.setOAuthToken( tokenStorage.getToken(), tokenStorage.getTokenSecret() );
      out.print("<html>" +
        "<h1>HELLO</h1>" +
        "</html>");
      for (int i=0; i<client_.getInvoices().size();i++)
      {
        Invoice invoice = new Invoice();
        invoice.setId(Long.parseLong(client_.getInvoice(""+i).getInvoiceID()));
        invoice.setInvoiceNumber(client_.getInvoice(""+i).getInvoiceNumber());
        invoice.setAmount(client_.getInvoice(""+i).getTotal().longValue());
      }

    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }

}
