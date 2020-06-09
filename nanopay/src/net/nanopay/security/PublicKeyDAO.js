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
  name: 'PublicKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Stores the encoded version of the public key',

  javaImports: [
    'org.bouncycastle.util.encoders.Base64',
    'java.security.KeyFactory',
    'java.security.PublicKey',
    'java.security.spec.X509EncodedKeySpec'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        foam.core.FObject obj = super.find_(x, id);
        PublicKeyEntry entry = (PublicKeyEntry) obj;
        if ( entry == null ) {
          throw new RuntimeException("Public key not found");
        }

        // A decorator lower down in the chain might have already decoded the public key
        if ( entry.getPublicKey() != null ) return entry;

        try {
          // initialize key factory to rebuild public key
          KeyFactory factory = KeyFactory.getInstance(entry.getAlgorithm());

          // decode base64 public key bytes, create key spec, and generate public key
          byte[] encodedBytes = Base64.decode(entry.getEncodedPublicKey());
          X509EncodedKeySpec spec = new X509EncodedKeySpec(encodedBytes);
          PublicKey publicKey = factory.generatePublic(spec);

          entry.setPublicKey(publicKey);
          return entry;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'put_',
      javaCode: `
        PublicKeyEntry entry = (PublicKeyEntry) obj;
        PublicKey publicKey = entry.getPublicKey();
        if ( publicKey == null ) {
          throw new RuntimeException("Public key not found");
        }

        entry.setEncodedPublicKey(Base64.toBase64String(publicKey.getEncoded()));
        entry.setPublicKey(null);
        return super.put_(x, entry);
      `
    }
  ]
});
