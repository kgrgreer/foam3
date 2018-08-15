package net.nanopay.bank;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;

import java.util.regex.Pattern;

/**
 * Validates BankAccount objects
 */
public class BankAccountValidator
    implements Validator
{
  private static BankAccountValidator instance_ = null;

  public static BankAccountValidator instance() {
    if ( instance_ == null ) {
      instance_ = new BankAccountValidator();
    }
    return instance_;
  }

  protected final static Pattern ACCOUNT_NUMBER =
      Pattern.compile("^[0-9]{0,7}$");
  protected final static Pattern TRANSIT_NUMBER =
      Pattern.compile("^[0-9]{5}$");
  protected final static Pattern INSTITUTION_NUMBER =
      Pattern.compile("^[0-9]{3}$");

  private BankAccountValidator() {}

  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
//    if ( ! (obj instanceof BankAccount) ) {
//      throw new IllegalStateException("Invalid bank account");
//    }
//
//    BankAccount account = (BankAccount) obj;
//
//    // validate account name
//    String name = account.getName();
//    if ( SafetyUtil.isEmpty(name) ) {
//      throw new IllegalStateException("Please enter an account name.");
//    }
//
//    if ( name.length() > 70 ) {
//      throw new IllegalStateException("Account name must be less than or equal to 70 characters.");
//    }
//
//    // validate account number
//    String accountNumber = account.getAccountNumber();
//    if ( SafetyUtil.isEmpty(accountNumber) ) {
//      throw new IllegalStateException("Please enter an account number.");
//    }
//
//    if ( ! ACCOUNT_NUMBER.matcher(accountNumber).matches() ) {
//      throw new IllegalStateException("Invalid account number.");
//    }
//
//    // validate transit number
//    if ( account.findBranch() == null || account.getBranch() == 0 ) {
//      throw new IllegalStateException("Please enter a branch number");
//    }
//
//    if ( ! TRANSIT_NUMBER.matcher(String.valueOf(account.getBranch())).matches() ) {
//      throw new IllegalStateException("Invalid branch.");
//    }
//
//  if ( account.findBranch() == null || account.getInstitution() == 0 ) {
//      throw new IllegalStateException("Please enter an institution number");
//    }
//
//  if ( ! INSTITUTION_NUMBER.matcher(String.valueOf(account.getInstitution())).matches() ) {
//      throw new IllegalStateException("Invalid institution number.");
//    }
  }
}
