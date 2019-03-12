package net.nanopay.integration.quick;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.lib.json.Outputter;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.List;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.integration.AccountingBankAccount;
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.quick.model.*;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.model.Currency;
import net.nanopay.tx.model.Transaction;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;

/*
* Decorater to determine if a QuickBooks invoice is sent back to Quickbooks
* Checks if invoice, bank and payee/payer have valid Quickbooks information and sends the data back.
* If user is not signed into integration platform will set a flag on the invoice and it will reattempt on resynchronising
*/
public class QuickInvoiceDAO
  extends ProxyDAO {

  public QuickInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  public FObject put_(X x, FObject obj) {
    // If the put fails or an issue arises lets the invoice process continue
    return getDelegate().put_(x, obj);
  }
}
