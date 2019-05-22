package net.nanopay.account;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import static foam.mlang.MLang.INSTANCE_OF;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;

import net.nanopay.model.Business;

public class DigitalAccountService
  extends ContextAwareSupport
  implements DigitalAccountServiceInterface {

  public DigitalAccount findDefault(X x, String denomination) {
      User user = (User) x.get("user");
     if ( user instanceof Business || user.getGroup().equals("sme") ) {
       DAO accountDAO = (DAO) x.get("localAccountDAO");
       OverdraftAccount overdraft = (OverdraftAccount) OverdraftAccount.findDefault(x, user, denomination, new OverdraftAccount()).fclone();

       DebtAccount debtAccount = overdraft.findDebtAccount(x);

       if ( debtAccount == null ) {
         overdraft = (OverdraftAccount) accountDAO.put(overdraft).fclone();
         debtAccount = (DebtAccount) accountDAO.put(
           new DebtAccount.Builder(x)
             .setDebtorAccount(overdraft.getId())
             .setParent(overdraft.getId())
             .setName("DebtAccount for: " + overdraft.getId())
             .build()).fclone();
       }
         overdraft.setDebtAccount(debtAccount.getId());
         overdraft = (OverdraftAccount) accountDAO.put(overdraft).fclone();


       return overdraft;
     }

     else {
       return DigitalAccount.findDefault(getX(), user, denomination);
     }
  }
}
