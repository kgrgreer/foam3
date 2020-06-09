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
  name: 'AbstractFileKeyStoreManager',
  extends: 'net.nanopay.security.AbstractKeyStoreManager',
  abstract: true,

  documentation: 'Abstract KeyStoreManager that uses a file to store keys.',

  javaImports: [
    'foam.util.SafetyUtil',

    'java.io.*',
    'java.nio.charset.StandardCharsets',
    'java.security.KeyStore'
  ],

  properties: [
    {
      class: 'String',
      name: 'type',
      documentation: 'KeyStore type.'
    },
    {
      class: 'String',
      name: 'provider',
      documentation: 'KeyStore crypto provider.'
    },
    {
      class: 'String',
      name: 'keyStorePath',
      documentation: 'Path to keystore file.'
    },
    {
      class: 'String',
      name: 'passphrasePath',
      documentation: 'Path to passphrase file.'
    },
    {
      class: 'Object',
      name: 'keyStoreFile',
      documentation: 'KeyStore file.',
      transient: true,
      javaType: 'java.io.File',
      javaFactory: `
        return new File(getKeyStorePath()).getAbsoluteFile();
      `
    },
    {
      class: 'Object',
      name: 'passphraseFile',
      documentation: 'Passphrase file',
      transient: true,
      javaType: 'java.io.File',
      javaFactory: `
        return new File(getPassphrasePath()).getAbsoluteFile();
      `
    },
    {
      class: 'Object',
      name: 'keyStore',
      documentation: 'Keystore file where all of the keys are stored.',
      transient: true,
      javaType: 'java.security.KeyStore',
      javaFactory: `
        try {
          return ! SafetyUtil.isEmpty(getProvider()) ?
            KeyStore.getInstance(getType(), getProvider()) :
            KeyStore.getInstance(getType());
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      class: 'Object',
      name: 'passphrase',
      documentation: 'Passphrase used to load KeyStore',
      transient: true,
      type: 'Char[]',
      javaFactory: `
        try {
          StringBuilder builder = new StringBuilder();
          File passphraseFile = getPassphraseFile();

          try ( BufferedReader reader = new BufferedReader(new InputStreamReader(
            new FileInputStream(passphraseFile), StandardCharsets.UTF_8)) ) {
            String line;
            while ( (line = reader.readLine()) != null ) {
              builder.append(line);
            }
          }

          return builder.toString().toCharArray();
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
          // check for keystore and passphrase file
          KeyStore keyStore = getKeyStore();
          File keyStoreFile = getKeyStoreFile();
          char[] passphrase = getPassphrase();

          // load keystore file using password
          try ( FileInputStream fis = new FileInputStream(keyStoreFile) ) {
            keyStore.load(fis, passphrase);
          }

          // set unlocked to true
          unlocked.set(true);
        }
      `
    },
    {
      name: 'loadKey',
      synchronized: true,
      javaCode: `
        return this.loadKey_(alias, new KeyStore.PasswordProtection(getPassphrase()));
      `
    },
    {
      name: 'storeKey',
      synchronized: true,
      javaCode: `
        this.storeKey_(alias, entry, new KeyStore.PasswordProtection(getPassphrase()));
      `
    },
    {
      name: 'storeKey_',
      synchronized: true,
      javaCode: `
        // store key
        super.storeKey_(alias, entry, protParam);

        // save keystore file
        try (FileOutputStream fos = new FileOutputStream(getKeyStoreFile())) {
          getKeyStore().store(fos, getPassphrase());
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
