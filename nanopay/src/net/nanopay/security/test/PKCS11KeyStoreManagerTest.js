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
  package: 'net.nanopay.security.test',
  name: 'PKCS11KeyStoreManagerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.util.SafetyUtil',
    'foam.util.SecurityUtil',
    'net.nanopay.security.PKCS11KeyStoreManager',
    'javax.crypto.KeyGenerator',
    'javax.crypto.SecretKey',
    'java.io.*',
    'java.nio.charset.StandardCharsets',
    'java.security.KeyStore',
    'java.security.Provider',
    'java.security.Security',
    'java.util.Arrays'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // don't run if soft hsm is not installed
        if ( ! SecurityTestUtil.IsSoftHSMInstalled() ) {
          return;
        }

        // reset soft hsm
        String token = SecurityTestUtil.ResetSoftHSM();
        if ( SafetyUtil.isEmpty(token) ) {
          return;
        }

        // initialization tests
        PKCS11KeyStoreManager_ValidConfiguration(token);
        PKCS11KeyStoreManager_InvalidLibrary();
        // PKCS11KeyStoreManager_InvalidPassphrase();
        PKCS11KeyStoreManager_InvalidSlotListIndex();

        // key storage tests
        PKCS11KeyStoreManager_StoringSecretKey(token);
      `
    },
    {
      name: 'PKCS11KeyStoreManager_ValidConfiguration',
      args: [
        {
          name: 'token',
          type: 'String'
        }
      ],
      javaCode: `
        try {
          String config = "--name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslot=" + token;
          Provider provider = Security.getProvider("SunPKCS11").configure(config);
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider)
            .setLoadStoreParameter(new KeyStore.LoadStoreParameter() {
              @Override
              public KeyStore.ProtectionParameter getProtectionParameter() {
                return new KeyStore.PasswordProtection("test".toCharArray());
              }
            })
            .build();
          manager.unlock();

          KeyStore keyStore = manager.getKeyStore();
          test(keyStore != null, "Generating a PKCS11KeyStoreManager with valid configuration creates KeyStore successfully");
          test(keyStore.size() == 0, "Generating a PKCS11KeyStoreManager with valid configuration and no keys returns key size of 0");
        } catch ( Throwable t ) {
          test(false, "Generating a PKCS11KeyStoreManager with valid configuration should not throw an exception");
        }
      `
    },
    {
      name: 'PKCS11KeyStoreManager_InvalidLibrary',
      javaCode: `
        try {
          String config = "--name=SoftHSM2\\nlibrary=iqnfiernf2oi4rnf2ijnrf\\nslotListIndex=0";
          Provider provider = Security.getProvider("SunPKCS11").configure(config);
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider)
            .setLoadStoreParameter(new KeyStore.LoadStoreParameter() {
              @Override
              public KeyStore.ProtectionParameter getProtectionParameter() {
                return new KeyStore.PasswordProtection("test".toCharArray());
              }
            })
            .build();
          manager.unlock();

          test(false, "Generating a PKCS11KeyStoreManager with invalid configuration should throw an exception.");
        } catch ( Throwable t ) {
          test(true, "Generating a PKCS11KeyStoreManager with invalid configuration throws an exception");
        }
      `
    },
    {
      name: 'PKCS11KeyStoreManager_InvalidPassphrase',
      javaCode: `
        try {
          String config = "--name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslotListIndex=9";
          Provider provider = Security.getProvider("SunPKCS11").configure(config);
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider)
            .setLoadStoreParameter(new KeyStore.LoadStoreParameter() {
              @Override
              public KeyStore.ProtectionParameter getProtectionParameter() {
                return new KeyStore.PasswordProtection("incorrect".toCharArray());
              }
            })
            .build();
          manager.unlock();

          test(false, "Generating a PKCS11KeyStoreManager with invalid passphrase should thrown an exception");
        } catch ( Throwable t ) {
          test(true, "Generating a PKCS11KeyStoreManager with invalid passphrase throws an exception");
        }
      `
    },
    {
      name: 'PKCS11KeyStoreManager_InvalidSlotListIndex',
      javaCode: `
        try {
          String config = "--name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslotListIndex=9";
          Provider provider = Security.getProvider("SunPKCS11").configure(config);
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider)
            .setLoadStoreParameter(new KeyStore.LoadStoreParameter() {
              @Override
              public KeyStore.ProtectionParameter getProtectionParameter() {
                return new KeyStore.PasswordProtection("test".toCharArray());
              }
            })
            .build();
          manager.unlock();

          test(false, "Generating a PKCS11KeyStoreManager with invalid slotListIndex should thrown an exception");
        } catch ( Throwable t ) {
          test(true, "Generating a PKCS11KeyStoreManager with invalid slotListIndex throws an exception");
        }
      `
    },
    {
      name: 'PKCS11KeyStoreManager_StoringSecretKey',
      args: [
        {
          name: 'token',
          type: 'String'
        }
      ],
      javaCode: `
        try {
          String config = "--name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslot=" + token;
          Provider provider = Security.getProvider("SunPKCS11").configure(config);
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider)
            .setLoadStoreParameter(new KeyStore.LoadStoreParameter() {
              @Override
              public KeyStore.ProtectionParameter getProtectionParameter() {
                return new KeyStore.PasswordProtection("test".toCharArray());
              }
            })
            .build();
          manager.unlock();

          KeyStore keyStore = manager.getKeyStore();
          int keyStoreSize = keyStore.size();

          // generate secret key
          KeyGenerator keygen = KeyGenerator.getInstance("AES", keyStore.getProvider());
          keygen.init(256, SecurityUtil.GetSecureRandom());

          // store secret key
          SecretKey key = keygen.generateKey();
          manager.storeKey("PKCS11KeyStoreManagerTest", new KeyStore.SecretKeyEntry(key));
          test(keyStore.size() == keyStoreSize + 1, "Storing a secret key using PKCS11KeyStoreManager stores key successfully");

          // load secret key
          KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) manager.loadKey("PKCS11KeyStoreManagerTest");
          SecretKey stored = entry.getSecretKey();
          test(Arrays.equals(key.getEncoded(), stored.getEncoded()), "Loaded SecretKey is equal to stored SecretKey");
        } catch ( Throwable t ) {
          test(false, "Storing a secret key using PKCS11KeyStoreManager should not throw an exception");
        }
      `
    }
  ]
});