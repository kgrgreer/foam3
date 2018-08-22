package net.nanopay.sps.exceptions;

import net.nanopay.sps.RequestMessageAndErrors;

public class ClientErrorException extends Exception {
  private RequestMessageAndErrors clientError_;

  public ClientErrorException(RequestMessageAndErrors clientError) {
    super();
    clientError_ = clientError;
  }

  public RequestMessageAndErrors getError() {
    return clientError_;
  }
}
