foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'MerkleTreeReceiptGenerator',

  implements: [
    'net.nanopay.security.receipt.ReceiptGenerator'
  ],

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
      synchronized: true,
      javaReturns: 'net.nanopay.security.MerkleTree',
      javaCode: `
        if ( builder_ == null ) {
          builder_ = new net.nanopay.security.MerkleTree(getAlgorithm());
        }
        return builder_;
      `
    },
    {
      name: 'add',
      synchronized: true,
      javaCode: `
        getBuilder().addHash(obj.hash(md_.get()));
      `
    },
    {
      name: 'build',
      synchronized: true,
      javaCode: `
        if ( tree_ == null ) {
          tree_ = getBuilder().buildTree();
        }
      `
    },
    {
      name: 'generate',
      synchronized: true,
      javaCode: `
        // build receipt, setting the path and data index in the process
        return net.nanopay.security.MerkleTreeHelper.SetPath(tree_, obj.hash(md_.get()),
            new net.nanopay.security.receipt.Receipt.Builder(getX()).setData(obj).build());
      `
    }
  ]
});
