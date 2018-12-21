package net.nanopay.bank;

import net.nanopay.model.Branch;
import net.nanopay.payment.Institution;
import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.util.SafetyUtil;
import java.util.regex.Pattern;

import static foam.mlang.MLang.*;

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
