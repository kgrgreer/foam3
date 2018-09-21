package net.nanopay.security;

import foam.core.AbstractPropertyInfo;
import foam.core.FObject;
import foam.util.SecurityUtil;

import java.security.MessageDigest;
import java.security.Signature;
import java.security.SignatureException;

public abstract class AbstractHexStringPropertyInfo
  extends AbstractPropertyInfo
{
  @Override
  public Object fromString(String value) {
    return SecurityUtil.HexStringToByteArray(value);
  }

  @Override
  public void updateDigest(FObject obj, MessageDigest md) {
    if ( ! includeInDigest() ) return;
    md.update((byte[]) get(obj));
  }

  @Override
  public void updateSignature(FObject obj, Signature sig) throws SignatureException {
    if ( ! includeInSignature() ) return;
    sig.update((byte[]) get(obj));
  }
}
