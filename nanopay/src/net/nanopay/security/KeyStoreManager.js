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

foam.INTERFACE({
  package: 'net.nanopay.security',
  name: 'KeyStoreManager',

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
    }
  ]
});
