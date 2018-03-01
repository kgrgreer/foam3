package net.nanopay.model;

import foam.core.FObject;
import foam.core.Validator;
import foam.util.SafetyUtil;

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
  public void validate(FObject obj) throws IllegalStateException {
    if ( ! (obj instanceof BankAccount) ) {
      throw new IllegalStateException("Invalid bank account");
    }

    BankAccount account = (BankAccount) obj;

    // validate account name
    String accountName = account.getAccountName();
    if ( SafetyUtil.isEmpty(accountName) ) {
      throw new IllegalStateException("Please enter an account name.");
    }

    if ( accountName.length() > 70 ) {
      throw new IllegalStateException("Account name must be less than or equal to 70 characters.");
    }

    // validate account number
    String accountNumber = account.getAccountNumber();
    if ( SafetyUtil.isEmpty(accountNumber) ) {
      throw new IllegalStateException("Please enter an account number.");
    }

    if ( ! ACCOUNT_NUMBER.matcher(accountNumber).matches() ) {
      throw new IllegalStateException("Invalid account number.");
    }

    // validate transit number
    String transitNumber = account.getTransitNumber();
    if ( SafetyUtil.isEmpty(transitNumber) ) {
      throw new IllegalStateException("Please enter a transit number");
    }

    if ( ! TRANSIT_NUMBER.matcher(transitNumber).matches() ) {
      throw new IllegalStateException("Invalid transit number.");
    }

    String institutionNumber = account.getInstitutionNumber();
    if ( SafetyUtil.isEmpty(institutionNumber) ) {
      throw new IllegalStateException("Please enter an instituion number");
    }

    if ( ! INSTITUTION_NUMBER.matcher(institutionNumber).matches() ) {
      throw new IllegalStateException("Invalid institution number.");
    }
  }
}