foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'MerkleTreeReceiptGenerator',
  extends: 'net.nanopay.security.receipt.AbstractReceiptGenerator',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected byte[][] tree_ = null;

          protected net.nanopay.security.MerkleTree builder_ = null;

          protected ThreadLocal<java.security.MessageDigest> md_ =
            new ThreadLocal<java.security.MessageDigest>() {
              @Override
              protected java.security.MessageDigest initialValue() {
                try {
                  return java.security.MessageDigest.getInstance(algorithm_);
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
      name: 'algorithm',
      value: 'SHA-256'
    }
  ],

  methods: [
    {
      name: 'getBuilder',
      javaReturns: 'net.nanopay.security.MerkleTree',
      javaCode: `
        if ( builder_ == null ) {
          builder_ = new net.nanopay.security.MerkleTree(getAlgorithm());
        }
        return builder_;
      `
    },
    {
      name: 'add_',
      args: [
        { class: 'FObjectProperty', name: 'obj' }
      ],
      javaCode: `
        getBuilder().addHash(obj.hash(md_.get()));
      `
    },
    {
      name: 'build',
      javaCode: `
        tree_ = getBuilder().buildTree();
      `
    },
    {
      name: 'generate',
      javaCode: `
        return null;
      `
    }
  ]
});
