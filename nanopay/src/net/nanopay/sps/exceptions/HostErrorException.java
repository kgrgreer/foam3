package net.nanopay.sps.exceptions;

import net.nanopay.sps.HostError;

public class HostErrorException extends Exception {
  private HostError hostError_;

  public HostErrorException(HostError hostError) {
    super();
    hostError_ = hostError;
  }

  public HostError getError() {
    return hostError_;
  }
}
