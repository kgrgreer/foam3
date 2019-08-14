package net.nanopay.meter.clearing;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Sum;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.payment.Institution;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;

public class ClearingTimeUtil {
  /**
   * Get clearing time duration of a transaction.
   *
   * Clearing time of a transaction is calculated as the sum of the clearing
   * times of the source account financial institution, business and spid.
   *
   * @param x Context object
   * @param transaction to get clearing time on
   * @return Clearing time duration
   */
  public static int getDuration(X x, Transaction transaction) {
    int institutionClearingTime = 0;
    int ownerClearingTime = 0;
    int spidClearingTime = 0;
    Account sourceAccount = transaction.findSourceAccount(x);
    User owner = sourceAccount.findOwner(x);

    // Get financial institution clearing
    if ( sourceAccount instanceof BankAccount ) {
      Institution institution = ((BankAccount) sourceAccount).findInstitution(x);
      institutionClearingTime = getDuration(x, institution);
    }

    // Get user/business clearing time
    ownerClearingTime = getDuration(x, owner);

    // Get spid clearing time
    spidClearingTime = getDuration(x, owner.findSpid(x));

    // Return default clearing time when institution, owner and spid are not set.
    if ( institutionClearingTime == 0
      && ownerClearingTime == 0
      && spidClearingTime == 0
    ) {
      return getDefault(x).getDuration();
    }

    // Return total clearing time
    return institutionClearingTime + ownerClearingTime + spidClearingTime;
  }

  /**
   * Get default clearing time.
   *
   * Use ClearingTime (id:1) as the default clearing time.
   * Will create one if not exist.
   *
   * @param x Context object
   * @return Default ClearingTime object
   */
  public static ClearingTime getDefault(X x) {
    long clearingTimeId = 1;
    DAO clearingTimeDAO = (DAO) x.get("clearingTimeDAO");
    ClearingTime clearingTime = (ClearingTime) clearingTimeDAO.find(clearingTimeId);
    if ( clearingTime == null ) {
      clearingTime = (ClearingTime) clearingTimeDAO.put(
        new ClearingTime.Builder(x)
          .setId(clearingTimeId)
          .setDuration(2)
          .build()
      );
    }
    return clearingTime;
  }

  private static int getDuration(X x, FObject obj) {
    DAO clearingTimeDAO = (DAO) x.get("clearingTimeDAO");
    return
      (int) ((Sum) clearingTimeDAO
        .where(DOT_F(ClearingTime.PREDICATE, obj))
        .select(SUM(ClearingTime.DURATION))
      ).getValue();
  }
}
