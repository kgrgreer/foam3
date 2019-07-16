package net.nanopay.tx.bmo.exceptions;

public class BmoSFTPException extends RuntimeException {

  public BmoSFTPException(Throwable cause) {
    super(cause);
  }

  public BmoSFTPException(String message) {
    super(message);
  }

  public BmoSFTPException(String message, Throwable cause) {
    super(message, cause);
  }

}
