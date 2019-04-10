package net.nanopay.accounting;

public class AccountingException extends RuntimeException {

  private AccountingErrorCodes errorCodes;

  public AccountingException(String message, AccountingErrorCodes errorCodes) {
    super(message);
    this.errorCodes = errorCodes;
  }

  public AccountingException(Throwable cause, AccountingErrorCodes errorCodes) {
    super(cause);
    this.errorCodes = errorCodes;
  }

  public AccountingException(String message, Throwable cause) {
    super(message, cause);
  }

  public AccountingException(String message, Throwable cause, AccountingErrorCodes errorCodes) {
    super(message, cause);
    this.errorCodes = errorCodes;
  }

  public AccountingErrorCodes getErrorCodes() {
    return errorCodes;
  }

  public void setErrorCodes(AccountingErrorCodes errorCodes) {
    this.errorCodes = errorCodes;
  }
}
