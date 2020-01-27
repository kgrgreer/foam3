package net.nanopay.security;

import foam.blob.HashingInputStream;
import foam.blob.HashingOutputStream;
import foam.dao.index.Index;
import foam.dao.index.ProxyIndex;
import org.apache.commons.io.IOUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.security.MessageDigest;
import java.util.Arrays;

public class HashingIndex
  extends ProxyIndex
{
  protected final String algorithm_;
  protected final ThreadLocal<MessageDigest> md_;

  public HashingIndex(Index delegate) {
    this("SHA-256", delegate);
  }

  public HashingIndex(String algorithm, Index delegate) {
    setDelegate(delegate);
    algorithm_ = algorithm;
    md_ = new ThreadLocal<MessageDigest>() {
      @Override
      protected MessageDigest initialValue() {
        try {
          return MessageDigest.getInstance(algorithm);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      }

      @Override
      public MessageDigest get() {
        MessageDigest md = super.get();
        md.reset();
        return md;
      }
    };
  }

  @Override
  public Object wrap(Object state) {
    try(
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
	    HashingOutputStream hos = new HashingOutputStream(md_.get(), baos);
	    ObjectOutputStream oos = new ObjectOutputStream(hos);
	) {
      oos.writeObject(state);

      // return hashed state
      return new HashedState(baos.toByteArray(), hos.digest());
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public Object unwrap(Object state) {
    try {
      // read in object from byte array while calculating hash
      HashedState hashed = (HashedState) state;
      Object original;
      try (
		  ByteArrayInputStream bais = new ByteArrayInputStream(hashed.getState());
		  HashingInputStream his = new HashingInputStream(md_.get(), bais);
		  ObjectInputStream ois = new ObjectInputStream(his)
	  ) {
          // verify digest
    	  original = ois.readObject();
        if ( ! Arrays.equals(hashed.getDigest(), his.digest()) ) {
          throw new RuntimeException("Digest verification failed.");
        }
      }
      // return original state
      return original;
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }
}
