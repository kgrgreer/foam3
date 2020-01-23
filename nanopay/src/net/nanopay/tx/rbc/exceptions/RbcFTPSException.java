package net.nanopay.tx.rbc.exceptions;

public class RbcFTPSException extends RuntimeException {

  public RbcFTPSException(Throwable cause) {
    super(cause);
  }

  public RbcFTPSException(String message) {
    super(message);
  }

  public RbcFTPSException(String message, Throwable cause) {
    super(message, cause);
  }

}
