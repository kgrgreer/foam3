package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.account.LoanAccount;
import net.nanopay.tx.model.*;

import java.util.List;

/**
 Cronjob calculates the interestRate on each account
**/
public class InterestAccrual implements ContextAgent {

  public InterestAccrual(){
  }

  @Override
  public void execute(X x) {
    List Accounts = ((ArraySink) ((DAO) x.get("accountDAO")).select(new ArraySink())).getArray();
    for ( Object obj : Accounts ) {
      if(obj instanceof LoanAccount){
        LoanAccount la = (LoanAccount) ((LoanAccount) obj).fclone();
        long bal = (long)la.findBalance(x);
        if(bal < 0) {
          long amount = (long) ( (-bal)*((la.getRate()/100)/365) );
          la.addInterest(x,amount);
          ((DAO) x.get("accountDAO")).put_(x,la);
        }
      }
    }
  }
}

