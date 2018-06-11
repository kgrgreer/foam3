foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingJournal',
  extends: 'foam.dao.ProxyJournal',

  javaImports: [
    'org.bouncycastle.util.encoders.Base64'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected byte[] previousHash_ = null;
          protected final Object lock_ = new Object();

          public String digest(foam.core.FObject obj) {
            return digest(obj, getAlgorithm());
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Hashing algorithm to use',
      value: 'SHA-256'
    },
    {
      class: 'Boolean',
      name: 'rollHashes',
      documentation: 'Roll hashes together',
      value: false,
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        FObject fobj = (FObject) obj;
        super.put(new HashedFObject.Builder(getX())
          .setId(fobj.getProperty("id"))
          .setAlgorithm(getAlgorithm())
          .setDigest(digest(fobj))
          .setValue(fobj)
          .build(), sub);
      `
    },
    {
      name: 'replay',
      javaCode: `
        return;

      `
    },
    {
      name: 'digest',
      javaReturns: 'String',
      args: [
        {
          class: 'FObjectProperty',
          name: 'obj'
        },
        {
          class: 'String',
          name: 'algorithm'
        }
      ],
      javaCode: `
        if ( rollHashes_ ) {
          synchronized ( lock_ ) {
            previousHash_ = obj.hash(algorithm, previousHash_);
            return Base64.toBase64String(previousHash_);
          }
        } else {
          return Base64.toBase64String(obj.hash(algorithm, null));
        }
      `
    }
  ]
});
