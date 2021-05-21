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
  name: 'PKCS11KeyStoreManager',
  extends: 'net.nanopay.security.AbstractKeyStoreManager',

  documentation: 'KeyStore that uses PKCS #11 as the API',

  javaImports: [
    'java.security.Security',
    'java.security.KeyStore'
  ],

  properties: [
    {
      class: 'String',
      name: 'config',
      documentation: 'Path to configuration file for PKCS#11 interface.',
      value: '/opt/nanopay/keys/pkcs11.cfg'
    },
    {
      class: 'Object',
      name: 'provider',
      documentation: 'KeyStore crypto provider',
      transient: true,
      javaType: 'java.security.Provider',
      javaFactory: `
        return Security.getProvider("SunPKCS11").configure(getConfig());
      `
    },
    {
      class: 'Object',
      name: 'loadStoreParameter',
      documentation: 'KeyStore loading parameters used for unlocking.',
      transient: true,
      required: true,
      javaType: 'java.security.KeyStore.LoadStoreParameter',
    },
    {
      class: 'Object',
      name: 'keyStore',
      documentation: 'KeyStore object.',
      transient: true,
      javaType: 'java.security.KeyStore',
      javaFactory: `
        try {
          return KeyStore.getInstance("PKCS11", getProvider());
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'unlock',
      javaCode: `
        if ( ! unlocked.get() ) {
          // unlock using load store parameter
          getKeyStore().load(getLoadStoreParameter());
          // set unlocked to true
          unlocked.set(true);
        }
      `
    }
  ]
});
