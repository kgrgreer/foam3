package net.nanopay.account;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;

public class DigitalAccountService
  extends ContextAwareSupport
  implements DigitalAccountServiceInterface {

  public void createDefaults(X x, String denomination, String[] trustAccounts) {
    for (String id : trustAccounts)
      findDefault(x, denomination, id);
  }

  public DigitalAccount findDefault(X x, String denomination, String trustAccount) {
    User user = ((Subject) x.get("subject")).getUser();

     if ( (user instanceof Business || user.getGroup().equals("sme") ) && SafetyUtil.equals("CAD",denomination) )   {
       DAO accountDAO = (DAO) x.get("localAccountDAO");
       OverdraftAccount overdraft = (OverdraftAccount) OverdraftAccount.findDefault(x, user, denomination, new OverdraftAccount(), null).fclone();
       overdraft.setName("OverdraftAccount for: " + overdraft.getOwner());
       DebtAccount debtAccount = (DebtAccount) overdraft.findDebtAccount(x);
       if ( debtAccount == null ) {
         debtAccount = (DebtAccount) overdraft.findDebtAccount(getX());
         if ( debtAccount != null ) {
           ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "debtAccount found via getX()");
         }
       }
       if ( debtAccount == null ) {
         debtAccount = (DebtAccount) accountDAO.put(
          new DebtAccount.Builder(x)
            .setDebtorAccount(overdraft.getId())
            .setCreditorAccount("6")
            .setParent(overdraft.getId())
            .setOwner(overdraft.getOwner())
            .setName("DebtAccount for: " + overdraft.getId())
            .build()).fclone();
       }
       overdraft.setDebtAccount(debtAccount.getId());
       overdraft = (OverdraftAccount) accountDAO.put(overdraft).fclone();

       return overdraft;
     } else {
       return DigitalAccount.findDefault(getX(), user, denomination, trustAccount);
     }
  }
}
