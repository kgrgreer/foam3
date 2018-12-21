package net.nanopay.security;

import foam.lib.json.FObjectParser;
import foam.lib.parse.*;
import org.bouncycastle.util.encoders.Hex;

import java.nio.charset.StandardCharsets;

public class HashedFObjectParser
  extends ProxyParser
{
  public HashedFObjectParser(HashingJournal hashingJournal) {
    this(hashingJournal, null);
  }

  public HashedFObjectParser(HashingJournal hashingJournal, final Class defaultClass) {
    setDelegate(new Parser() {
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
        if ( ps2 == null && ! hashingJournal.getDigestRequired() ) {
          return ps.setValue(ps1.value());
        }

        // check for message digest
        if ( ps2 == null ) {
          throw new RuntimeException("Digest not found");
        }

        // get message digest value
        net.nanopay.security.MessageDigest messageDigest =
          (net.nanopay.security.MessageDigest) ps2.value();

        // calculate digest based on JSON message
        byte[] digest;
        java.security.MessageDigest md;
        try {
          md = java.security.MessageDigest.getInstance(hashingJournal.getAlgorithm());
          md.update(message.getBytes(StandardCharsets.UTF_8));

          // calculate digest
          digest = md.digest();
          if (hashingJournal.getRollDigests() && hashingJournal.getPreviousDigest() != null) {
            md.update(hashingJournal.getPreviousDigest());
            md.update(digest);
            digest = md.digest();
          }

          hashingJournal.setPreviousDigest(Hex.decode(messageDigest.getDigest()));
        } catch ( Throwable t ) {
          throw new RuntimeException("Digest verification failed");
        }

        if ( ! Hex.toHexString(digest).equals(messageDigest.getDigest()) ) {
          throw new RuntimeException("Digest verification failed");
        }

        return ps.setValue(ps1.value());
      }
    });
  }
}
