foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PublicKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Stores the encoded version of the public key',

  javaImports: [
    'com.google.api.client.util.Base64',
    'java.security.PublicKey'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        PublicKeyEntry entry = (PublicKeyEntry) obj;
        PublicKey publicKey = entry.getPublicKey();
        if ( publicKey == null ) {
          throw new RuntimeException("Public key not found");
        }

        entry.setEncodedPublicKey(Base64.encodeBase64String(publicKey.getEncoded()));
        entry.setPublicKey(null);
        return super.put_(x, entry);
      `
    }
  ]
});
