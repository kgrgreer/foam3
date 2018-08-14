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
  protected final static Pattern ACCOUNT_NUMBER =
      Pattern.compile("^[0-9]{4,30}$");
  protected final static Pattern BRANCH_ID =
      Pattern.compile("^[0-9]{5}$");
  protected final static Pattern INSTITUTION_NUMBER =
      Pattern.compile("^[0-9]{3}$");

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
      validateAccountName(x, account);
      validateAccountNumber(account);
      validateInstitutionNumber(x, account);
      validateBranchId(x, account);
    }
  }

  public void validateAccountName(X x, BankAccount account) {
    // isempty
    String name = account.getName();
    if ( SafetyUtil.isEmpty(name) ) {
      throw new IllegalStateException("Please enter an account name.");
    }
    // length
    if ( name.length() > 70 ) {
      throw new IllegalStateException("Account name must be less than or equal to 70 characters.");
    }
    // already exists
    DAO accountDao = (DAO) x.get("localAccountDAO");

    Count count = new Count();
    count = (Count) accountDao.where(AND(
      INSTANCE_OF(BankAccount.class),
        EQ(BankAccount.OWNER, account.getOwner()),
        EQ(BankAccount.NAME, account.getName())
    )).limit(1).select(count);

    if ( count.getValue() > 0 ) {
      throw new IllegalStateException("Bank account with same name already registered.");
    }
  }

  public void validateAccountNumber(BankAccount account) {
    String accountNumber = account.getAccountNumber();
    // is empty
    if ( SafetyUtil.isEmpty(accountNumber) ) {
      throw new IllegalStateException("Please enter an account number.");
    }
    if ( ! this.ACCOUNT_NUMBER.matcher(accountNumber).matches() ) {
      throw new IllegalStateException("Please enter a valid account number.");
    }
  }

  public void validateInstitutionNumber(X x, BankAccount account) {
    Institution institution = account.findInstitution(x);
    // no validation when the institution is attached.
    if ( institution != null ) {
      return;
    }
    // when the institutionNumber is provided and not the institution
    String institutionNumber = account.getInstitutionNumber();
    if ( SafetyUtil.isEmpty(institutionNumber) ) {
      throw new IllegalStateException("Please enter an institution number.");
    }
    if ( ! this.INSTITUTION_NUMBER.matcher(institutionNumber).matches() ) {
      throw new IllegalStateException("Please enter a valid institution number.");
    }
  }

  public void validateBranchId(X x, BankAccount account) {
    Branch branch = account.findBranch(x);
    // no validation when the branch is attached.
    if (branch != null) {
      return;
    }
    // when the branchId is provided and not the branch
    String branchId = account.getBranchId();
    if (SafetyUtil.isEmpty(branchId)) {
      throw new IllegalStateException("Please enter a branch Id/ Transit Number.");
    }
    if (!this.BRANCH_ID.matcher(branchId).matches()) {
      throw new IllegalStateException("Please enter a valid branch Id/ Transit Number.");
    }
  }
}
