foam.CLASS({
  package: 'net.nanopay.security',
  name: 'MerkleTreeHelper',
  documentation: `Helper class for Merkle Tree operations.`,

  javaImports: [
    'org.bouncycastle.util.encoders.Hex',

    'net.nanopay.security.Receipt'
  ],

  methods: [
    {
      name: 'setPath',
      args: [
        {
          class: 'Object',
          javaType: 'byte[][]',
          name: 'tree'
        },
        {
          class: 'Object',
          javaType: 'byte[]',
          name: 'hash'
        },
        {
          class: 'Object',
          javaType: 'net.nanopay.security.Receipt',
          name: 'receipt'
        }
      ],
      javaThrows: ['java.lang.RuntimeException'],
      javaCode: `
        int index = -1;
        byte[][] walkedPath;

        for ( int n = (int) Math.ceil(tree.length / 2) ; n < tree.length; n++ ){
          if ( Hex.toHexString(tree[n]).equals(Hex.toHexString(hash)) ){
            index = n;
          }
        }

        receipt.setDataIndex(index);

        if ( index == -1 ) {
          throw new RuntimeException("MerkleTreeHelper :: Error :: Hash not found in the tree!");
        }

        int totalPaths = logBase2(index);
        walkedPath = new byte[totalPaths][tree[index].length];

        for ( int j = 0; j < totalPaths; j++ ){
          walkedPath[0] = tree[(int) Math.floor(index / Math.pow(2, j)) ^ 1];
        }

        receipt.setPath(walkedPath);
      `
    },
    {
      name: 'logBase2',
      documentation: 'Source: https://stackoverflow.com/a/3305710',
      javaReturns: 'int',
      args: [
        {
          class: 'Int',
          name: 'bits'
        }
      ],
      javaCode: `
        int log = 0;

        if ( ( bits & 0xffff0000 ) != 0 ) { bits >>>= 16; log = 16; }
        if ( bits >= 256 ) { bits >>>= 8; log += 8; }
        if ( bits >= 16  ) { bits >>>= 4; log += 4; }
        if ( bits >= 4   ) { bits >>>= 2; log += 2; }

        return log + ( bits >>> 1 );`
    }
  ]
});
