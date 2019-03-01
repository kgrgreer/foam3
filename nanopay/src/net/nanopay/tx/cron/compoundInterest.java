package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.account.LoanAccount;
import java.util.List;

/**
 Cronjob applies the amount of interest that each account owes
**/
public class compoundInterest implements ContextAgent {

  public compoundInterest(){}

  @Override
  public void execute(X x) {
    List Accounts = ((ArraySink) ((DAO) x.get("accountDAO")).select(new ArraySink())).getArray();
    for ( Object obj : Accounts ) {
      if(obj instanceof LoanAccount){
        LoanAccount la = (LoanAccount) ((LoanAccount) obj).fclone();
        if(la.getAccruedInterest()>0){
          la.compound(x);
          ((DAO) x.get("accountDAO")).put_(x,la);
        }
      }
    }
  }
}

