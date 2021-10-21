/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.security',
  name: 'KeyStoreManager',

  documentation: 'Simplified interface to work with File or Resource based Java KeyStore',

  implements: [
    'foam.nanos.NanoService'
  ],

  methods: [
    {
      name: 'getKeyStore',
      documentation: 'Returns the KeyStore.',
      javaType: 'java.security.KeyStore'
    },
    {
      name: 'unlock',
      documentation: 'Unlocks the KeyStore.',
      type: 'Void',
      javaThrows: [
        'java.security.cert.CertificateException',
        'java.security.NoSuchAlgorithmException',
        'java.io.IOException'
      ]
    },
    {
      name: 'loadKey',
      documentation: 'Loads a key from the KeyStore.',
      javaType: 'java.security.KeyStore.Entry',
      javaThrows: [
        'java.security.UnrecoverableEntryException',
        'java.security.NoSuchAlgorithmException',
        'java.security.KeyStoreException'
      ],
      args: [
        {
          name: 'alias',
          type: 'String'
        }
      ]
    },
    {
      name: 'loadKey_',
      documentation: 'Loads a key from the KeyStore using additional protection parameter.',
      javaType: 'java.security.KeyStore.Entry',
      javaThrows: [
        'java.security.UnrecoverableEntryException',
        'java.security.NoSuchAlgorithmException',
        'java.security.KeyStoreException'
      ],
      args: [
        {
          name: 'alias',
          type: 'String'
        },
        {
          name: 'protParam',
          javaType: 'java.security.KeyStore.ProtectionParameter'
        }
      ]
    },
    {
      name: 'storeKey',
      documentation: 'Stores a new key.',
      type: 'Void',
      javaThrows: [
        'java.security.KeyStoreException'
      ],
      args: [
        {
          name: 'alias',
          type: 'String'
        },
        {
          name: 'entry',
          javaType: 'java.security.KeyStore.Entry'
        }
      ]
    },
    {
      name: 'storeKey_',
      documentation: 'Stores a new key using additional protection parameter.',
      type: 'Void',
      javaThrows: [
        'java.security.KeyStoreException'
      ],
      args: [
        {
          name: 'alias',
          type: 'String'
        },
        {
          name: 'entry',
          javaType: 'java.security.KeyStore.Entry'
        },
        {
          name: 'protParam',
          javaType: 'java.security.KeyStore.ProtectionParameter'
        }
      ]
    },
    {
      documentation: `Retrieve a password from the keystore imported via importpass.
keytool -importpass \
 -v \
 -alias "$ALIAS" \
 -keypass "$PASSWORD" \
 -keyalg PBEWithHmacSHA256AndAES_128 \
 -keysize 256 \
 -keystore "$DOMAIN.jks" \
 -storepass "$PASSWORD" \
 -storetype PKCS12 \
 <<<"$SECRET"
`,
      name: 'getSecret',
      type: 'String',
      javaThrows: [
        'java.lang.IllegalArgumentException',
        'java.io.IOException',
        'java.security.GeneralSecurityException'
      ],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'alias',
          type: 'String'
        },
        {
          documentation: 'A PBE Algorithm. See https://docs.oracle.com/en/java/javase/11/docs/specs/security/standard-names.html#keystore-types',
          name: 'algorithm',
          type: 'String'
        }
      ]
    }
  ]
});
