package net.nanopay.security;

import foam.core.AbstractArrayPropertyInfo;
import foam.core.FObject;

import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;

public abstract class AbstractHexStringArrayPropertyInfo
  extends AbstractArrayPropertyInfo
{
  @Override
  public String of() {
    return "byte[]";
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    byte[][] value = (byte[][]) get(obj);
    for ( byte[] bytes : value ) {
      md.update(bytes);
    }
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    byte[][] value = (byte[][]) get(obj);
    for ( byte[] bytes : value ) {
      sig.update(bytes);
    }
  }
}
