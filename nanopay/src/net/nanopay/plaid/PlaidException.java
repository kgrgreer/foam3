package net.nanopay.plaid;

public class PlaidException extends RuntimeException {

  String errorBody;

  public PlaidException(String errorBody) {
    this.errorBody = errorBody;
  }

  public String getErrorBody() {
    return errorBody;
  }

  public void setErrorBody(String errorBody) {
    this.errorBody = errorBody;
  }
}
