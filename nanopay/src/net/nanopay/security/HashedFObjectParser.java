/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.security;

import foam.lib.json.FObjectParser;
import foam.lib.parse.*;
import org.bouncycastle.util.encoders.Hex;

import java.nio.charset.StandardCharsets;

public class HashedFObjectParser
  extends ProxyParser
{
  public HashedFObjectParser(final MessageDigest messageDigest, final boolean digestRequired) {
    this(messageDigest, null, digestRequired);
  }

  public HashedFObjectParser(final MessageDigest messageDigest, final Class defaultClass, final boolean digestRequired) {
    setDelegate(new Parser() {
      private Parser parser1 = FObjectParser.create(defaultClass);
      private Parser parser2 = new Seq1(1,
        new Optional(Literal.create(",")),
        FObjectParser.create(net.nanopay.security.MessageDigest.class));

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

        if ( digestRequired ) {
          if ( ps2 == null ) {
            throw new RuntimeException("Digest not found");
          }

          messageDigest.setPreviousDigest(messageDigest.verify(message, (MessageDigest) ps2.value()));
        }

        return ps.setValue(ps1.value());
      }
    });
  }
}
