package net.nanopay.tx.cron;

import static foam.mlang.MLang.INSTANCE_OF;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import net.nanopay.account.LoanAccount;

/**
 Cronjob applies the amount of interest that each account owes
**/
public class CompoundInterest implements ContextAgent {

  public CompoundInterest(){}

  @Override
  public void execute(X x) {
    DAO accountDAO = (DAO) x.get("accountDAO");

    accountDAO
      .where(
        INSTANCE_OF(LoanAccount.class)
      )
      .select(new AbstractSink(){
        @Override
        public void put(Object o, Detachable d ) {
          LoanAccount la = (LoanAccount) ((LoanAccount) o).deepClone();
          if ( la.getAccruedInterest() > 0 ){
            la.compound(x);
            accountDAO.put_(x,la);
          }
        }
      });
  }
}

