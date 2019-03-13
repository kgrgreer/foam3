package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import net.nanopay.account.LoanAccount;

import static foam.mlang.MLang.INSTANCE_OF;
/**
 Cronjob calculates the interestRate on each account
**/
public class InterestAccrual implements ContextAgent {

  public InterestAccrual(){}

  @Override
  public void execute(X x) {
    DAO accountDao = (DAO) x.get("accountDAO");

    accountDao
      .where(
        INSTANCE_OF(LoanAccount.class)
      )
      .select( new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          LoanAccount la = (LoanAccount) ((LoanAccount) o).deepClone();
          long bal = (long) la.findBalance(x);
          if ( bal < 0 ) {
            long amount = (long) ( (-bal)*((la.getRate()/100)/365) );
            la.addInterest(x,amount);
            accountDao.put(la);
          }
        }
      });
  }
}

