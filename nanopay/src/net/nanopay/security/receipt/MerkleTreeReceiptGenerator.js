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

          protected java.util.Set<foam.core.FObject> notifiers_ = java.util.concurrent.ConcurrentHashMap.newKeySet();

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
        notifiers_.add(obj);
      `
    },
    {
      name: 'build',
      javaCode: `
        tree_ = getBuilder().buildTree();
        for ( foam.core.FObject obj : notifiers_ ) {
          obj.notify();
        }
      `
    },
    {
      name: 'generate',
      javaCode: `
        // build receipt, setting the path and data index in the process
        return net.nanopay.security.MerkleTreeHelper.SetPath(tree_, obj.hash(md_.get()),
            new net.nanopay.security.receipt.Receipt.Builder(getX()).setData(obj).build());
      `
    }
  ]
});
