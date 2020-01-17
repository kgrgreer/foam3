package net.nanopay.bank;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.DAO;

/**
 * Validates BankAccount objects
 */
public class BankAccountValidator
    implements Validator
{
  public BankAccountValidator() { }

  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
    if ( ! ( obj instanceof BankAccount ) ) {
      // only validate Bank accounts, skip for Digital Account.
      return;
    }

    BankAccount account = (BankAccount) obj;
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    if ( accountDAO.find(account) == null ) {
      // validation for a new account.
      // validations live in thier respective models.
      account.validate(x);
    }
  }
}
