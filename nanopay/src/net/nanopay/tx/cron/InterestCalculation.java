/*package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.account.LoanAccount;
import net.nanopay.tx.model.*;

import java.util.List;


    Cronjob calculates interestRate to add to an account.
    Does calculation for each account

public class InterestCalculation implements ContextAgent {

  public InterestCalculation(){

  }

  @Override
  public void execute(X x) {
    List Accounts = ((ArraySink) ((DAO) x.get("accountDAO")).select(new ArraySink())).getArray();
    for ( Object obj : Accounts ) {
      if(obj instanceof LoanAccount){
        LoanAccount la = (LoanAccount) obj;
        long bal = (long)la.findBalance(x);
        if(bal<0) {
          long amount = (long) ((-bal)*(la.getRate()/365));
          (la.getAccumulatedInterest()+amount);
          if (amount>0) {
            Transaction interestTX = new Transaction.Builder(x)
              .setSourceAccount(la.getId())
              .setDestinationAccount(171)
              .setAmount(amount)
              .build();
            ((DAO) x.get("transactionDAO")).put_(x, interestTX);
          }
        }
      }
    }
  }
}
*/
