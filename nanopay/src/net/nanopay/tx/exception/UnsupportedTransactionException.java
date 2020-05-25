package net.nanopay.tx.exception;

public class UnsupportedTransactionException extends RuntimeException {

  public UnsupportedTransactionException(String message) {
    super(message);
  }

  public UnsupportedTransactionException(String message, Throwable cause) {
    super(message, cause);
  }
}
