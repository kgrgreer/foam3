package net.nanopay.tx.exception;

public class UnsupportedTransactionException extends RuntimeException {

  public UnsupportedTransactionException(String message) {
    super(message);
  }
}
