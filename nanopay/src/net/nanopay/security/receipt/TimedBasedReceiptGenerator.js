foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'TimedBasedReceiptGenerator',

  implements: [
    'net.nanopay.security.receipt.ReceiptGenerator'
  ],

  javaImports: [
    'foam.util.SecurityUtil',
    'net.nanopay.security.KeyStoreManager',
    'org.bouncycastle.asn1.x500.X500Name',
    'org.bouncycastle.cert.X509CertificateHolder',
    'org.bouncycastle.cert.X509v3CertificateBuilder',
    'org.bouncycastle.cert.jcajce.JcaX509CertificateConverter',
    'org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder',
    'org.bouncycastle.operator.ContentSigner',
    'org.bouncycastle.operator.jcajce.JcaContentSignerBuilder',
    'java.math.BigInteger',
    'java.security.*',
    'java.security.cert.Certificate',
    'java.security.cert.X509Certificate',
    'java.util.Calendar',
    'java.util.TimeZone'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected byte[][] tree_ = null;

          protected byte[] signature_ = null;

          protected net.nanopay.security.MerkleTree builder_ = null;

          protected final java.util.Map<foam.core.FObject, byte[]> map_ =
            new java.util.concurrent.ConcurrentHashMap<>();

          protected final java.util.concurrent.atomic.AtomicBoolean generated_ =
            new java.util.concurrent.atomic.AtomicBoolean(false);

          protected final ThreadLocal<java.security.MessageDigest> md_ =
            new ThreadLocal<java.security.MessageDigest>() {
              @Override
              protected java.security.MessageDigest initialValue() {
                try {
                  return java.security.MessageDigest.getInstance(getHashingAlgorithm());
                } catch ( Throwable t ) {
                  throw new RuntimeException(t);
                }
              }

              @Override
              public java.security.MessageDigest get() {
                java.security.MessageDigest md = super.get();
                md.reset();
                return md;
              }
            };
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'hashingAlgorithm',
      documentation: 'Hashing algorithm',
      value: 'SHA-256'
    },
    {
      class: 'Long',
      name: 'interval',
      documentation: 'Interval between receipt generating in milliseconds',
      value: 100
    },
    {
      class: 'String',
      name: 'keyPairAlgorithm',
      documentation: 'Signing key algorithm',
      value: 'RSA'
    },
    {
      class: 'String',
      name: 'signingAlgorithm',
      documentation: 'Signing algorithm',
      value: 'SHA256withRSA'
    },
    {
      class: 'Int',
      name: 'keySize',
      documentation: 'Signing key key size',
      value: 4096
    },
    {
      class: 'String',
      name: 'alias',
      documentation: 'Alias for key used to sign',
    },
    {
      class: 'Object',
      name: 'privateKey',
      documentation: 'Private key used for signing',
      javaType: 'java.security.PrivateKey',
      javaFactory: `
        try {
          KeyStoreManager manager = (KeyStoreManager) getX().get("keyStoreManager");
          KeyStore keyStore = manager.getKeyStore();

          if (keyStore.containsAlias(getAlias())) {
            KeyStore.PrivateKeyEntry entry = (KeyStore.PrivateKeyEntry) manager.loadKey(getAlias());
            return entry.getPrivateKey();
          }

          KeyPairGenerator keygen = KeyPairGenerator.getInstance(getKeyPairAlgorithm());
          keygen.initialize(getKeySize(), SecurityUtil.GetSecureRandom());

          KeyPair keyPair = keygen.generateKeyPair();
          PrivateKey privateKey = keyPair.getPrivate();

          // set up isser and subject DN
          String issuer, subject;
          issuer = subject = "CN=*.nanopay.net, O=nanopay Corporation, L=Toronto, ST=Ontario, C=CA";

          // set certificate expiry to be in 10 years
          Calendar now = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
          Calendar nowPlus10 = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
          nowPlus10.setTime(now.getTime());
          nowPlus10.add(Calendar.YEAR, 10);

          // create certificate builder
          X509v3CertificateBuilder builder = new JcaX509v3CertificateBuilder(
            new X500Name(issuer),
            new BigInteger(64, SecurityUtil.GetSecureRandom()),
            now.getTime(),
            nowPlus10.getTime(),
            new X500Name(subject),
            keyPair.getPublic());

          // create self signed certificate and store private key
          String algorithm = "RSA".equals(privateKey.getAlgorithm()) ? "SHA256WithRSAEncryption" : "SHA256withECDSA";
          ContentSigner signer = new JcaContentSignerBuilder(algorithm).build(privateKey);
          X509CertificateHolder holder = builder.build(signer);
          X509Certificate certificate = new JcaX509CertificateConverter().getCertificate(holder);
          manager.storeKey(getAlias(), new KeyStore.PrivateKeyEntry(privateKey, new Certificate[]{ certificate }));
          return privateKey;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'getBuilder',
      synchronized: true,
      type: 'net.nanopay.security.MerkleTree',
      javaCode: `
        if ( builder_ == null ) {
          builder_ = new net.nanopay.security.MerkleTree(getHashingAlgorithm());
        }
        return builder_;
      `
    },
    {
      name: 'add',
      javaCode: `
        // synchronizing to enable usage of wait/notifyAll
        synchronized ( generated_ ) {
          // wait until all receipts have been generate
          while ( generated_.get() ) {
            generated_.wait();
          }

          // generate hash and add to tree and map
          byte[] digest = obj.hash(md_.get());
          getBuilder().addHash(digest);
          map_.put(obj, digest);
        }
      `
    },
    {
      name: 'build',
      javaCode: `
        // synchronizing to enable usage of wait/notifyAll
        synchronized ( generated_ ) {
          // only build the Merkle tree if the existing tree is null and
          // the receipt count is 0
          if ( tree_ == null && signature_ == null && map_.size() != 0 ) {
            // create tree
            tree_ = getBuilder().buildTree();

            // sign root of tree
            try {
              Signature sig = Signature.getInstance(getSigningAlgorithm());
              sig.initSign(getPrivateKey(), SecurityUtil.GetSecureRandom());
              sig.update(tree_[0]);
              signature_ = sig.sign();
            } catch ( Throwable t ) {
              throw new RuntimeException(t);
            }

            // set generated to true
            generated_.set(true);
            generated_.notifyAll();
          }
        }
      `
    },
    {
      name: 'generate',
      javaCode: `
        // synchronizing to enable usage of wait/notifyAll
        synchronized ( generated_ ) {
          // wait until merkle tree is built
          while ( ! generated_.get() ) {
            generated_.wait();
          }

          if ( ! map_.containsKey(obj) ) {
            throw new RuntimeException("Object not contained in current block");
          }

          // generate the receipts and set the path
          Receipt receipt = net.nanopay.security.MerkleTreeHelper.SetPath(tree_, map_.remove(obj),
            new net.nanopay.security.receipt.Receipt.Builder(getX()).setSignature(signature_).setData(obj).build());

          // wait until all receipts are generating
          // before destroying tree and setting generated
          // flag to false
          if ( map_.size() == 0 ) {
            tree_ = null;
            signature_ = null;
            generated_.set(false);
            generated_.notifyAll();
          }

          return receipt;
        }
      `
    },
    {
      name: 'start',
      javaCode: `
        // schedule the building of the Merkle tree
        java.util.concurrent.Executors.newScheduledThreadPool(16).scheduleAtFixedRate(new Runnable() {
          @Override
          public void run() {
            TimedBasedReceiptGenerator.this.build();
          }
        }, 1000, getInterval(), java.util.concurrent.TimeUnit.MILLISECONDS);
      `
    }
  ]
});
