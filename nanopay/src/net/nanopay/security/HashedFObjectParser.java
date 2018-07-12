package net.nanopay.security;

import foam.lib.json.FObjectParser;
import foam.lib.json.ObjectNullParser;
import foam.lib.parse.*;
import org.bouncycastle.util.encoders.Hex;

import java.nio.charset.StandardCharsets;

public class HashedFObjectParser
  extends ObjectNullParser
{
  public HashedFObjectParser() {
    this(null);
  }

  public HashedFObjectParser(final Class defaultClass) {
    super(
      new Parser() {

        private Parser parser1 = new FObjectParser(defaultClass);
        private Parser parser2 = new Seq1(1,
          new Optional(new Literal(",")),
          new FObjectParser(net.nanopay.security.MessageDigest.class));

        @Override
        public PStream parse(PStream ps, ParserContext x) {
          // parse FObject returning null upon error
          PStream ps1 = ps.apply(parser1, x);
          if ( ps1 == null || ps1.value() == null ) {
            return null;
          }

          // get journal entry as a string
          String message = ps.substring(ps1);

          // parse message digest
          PStream ps2 = ps1.apply(parser2, x);
          if ( ps2 == null ) {
            return ps.setValue(ps1.value());
          }

          // get message digest value
          net.nanopay.security.MessageDigest messageDigest =
            (net.nanopay.security.MessageDigest) ps2.value();

          // calculate digest based on JSON message
          java.security.MessageDigest md = null;
          try {
            md = java.security.MessageDigest.getInstance(messageDigest.getAlgorithm());
            md.update(message.getBytes(StandardCharsets.UTF_8));
          } catch ( Throwable t ) {
            throw new RuntimeException("Digest verification failed");
          }

          // check if calculated digest matches stored digest
          String digest = Hex.toHexString(md.digest());
          if ( ! digest.equals(messageDigest.getDigest()) ) {
            throw new RuntimeException("Digest verification failed");
          }

          return ps.setValue(ps1.value());
        }
      }
    );
  }
}
