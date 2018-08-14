package net.nanopay.security;

public class HashedState {

  protected byte[] state_;
  protected byte[] digest_;

  public HashedState(byte[] state, byte[] digest) {
    state_ = state;
    digest_ = digest;
  }

  public byte[] getState() {
    return state_;
  }

  public byte[] getDigest() {
    return digest_;
  }
}
