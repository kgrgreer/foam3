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

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PGPPublicKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Converts base64 encoded keys to a PGP compatible PublicKey',

  javaImports: [
    'java.io.ByteArrayInputStream',
    'java.io.InputStream',
    'java.security.KeyFactory',
    'java.security.PublicKey',
    'java.security.spec.X509EncodedKeySpec',
    'java.util.Iterator',

    'org.bouncycastle.openpgp.PGPPublicKey',
    'org.bouncycastle.openpgp.PGPPublicKeyRing',
    'org.bouncycastle.openpgp.PGPPublicKeyRingCollection',
    'org.bouncycastle.openpgp.operator.jcajce.JcaKeyFingerprintCalculator',
    'org.bouncycastle.openpgp.operator.jcajce.JcaPGPKeyConverter',
    'org.bouncycastle.util.encoders.Base64',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        foam.core.FObject obj = getDelegate().find_(x, id);
        PublicKeyEntry entry = (PublicKeyEntry) obj;
        if ( entry == null ) return entry;

        if ( ! "OpenPGP".equals(entry.getAlgorithm()) ) return entry;

        try {
          byte[] decodedBytes = Base64.decode(entry.getEncodedPublicKey());
          InputStream pubKeyIs = new ByteArrayInputStream(decodedBytes);
          PGPPublicKey PGPPublicKey = PGPKeyUtil.publicKeyParse(decodedBytes);
          PgpPublicKeyWrapper publicKey = new PgpPublicKeyWrapper(PGPPublicKey);
          entry = (PublicKeyEntry) entry.fclone();
          entry.setPublicKey(publicKey);
          return entry;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
  ]
});
