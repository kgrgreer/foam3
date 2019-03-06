package net.nanopay.integration;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.*;
import foam.nanos.auth.User;
import net.nanopay.bank.BankAccount;
import net.nanopay.integration.quick.NewQuickIntegrationService;
import net.nanopay.integration.xero.XeroIntegrationService2;
import java.util.List;

/**
 * This DAO selects bank accounts for Xero
 * or Quickbooks and returns the results in a sink
 */

public class BankIntegrationDAO
  extends ProxyDAO {
  public BankIntegrationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    DAO                         userDAO    = ((DAO) x.get("userDAO")).inX(x);
    DAO                         accountDAO = ((DAO) x.get("accountDAO")).inX(x);
    User                        user       = (User) userDAO.find(((User) x.get("user")).getId());
    XeroIntegrationService2      xero       = (XeroIntegrationService2) x.get("xeroSignIn");
    NewQuickIntegrationService     quick      = (NewQuickIntegrationService) x.get("quickSignIn");
    List<AccountingBankAccount> bankList;
    BankAccount userBank = (BankAccount) accountDAO.find(
      AND(
        INSTANCE_OF(BankAccount.class),
        EQ(
          user.getId(),
          BankAccount.OWNER
        )
      )
    );
    switch ( user.getIntegrationCode().ordinal() ) {
      case 1: { bankList = xero.pullBanks(x); break; }
      case 2: { bankList = quick.pullBanks(x); break; }
      default:{ bankList = null; break; }
    }
    if ( sink == null ) {
      sink = new ArraySink();
    }

    // Checks all bank accounts and grabs ones that match the banks currency
    if ( bankList != null ) {
      for ( AccountingBankAccount bank : bankList ) {
        if ( bank.getCurrencyCode().equals(userBank.getDenomination()) ) {
          sink.put(bank, null);
        }
      }
    }
    return sink;
  }
}
