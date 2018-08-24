foam.CLASS({
  package: 'net.nanopay.security',
  name: 'MerkleTreeTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.io.*',
    'java.util.Arrays',
    'java.security.MessageDigest',
    'java.nio.charset.StandardCharsets',
    'org.bouncycastle.util.encoders.Hex',

    'net.nanopay.security.MerkleTree',
  ],

  properties: [
    {
      class: 'Object',
      name: 'digest',
      javaType: 'java.security.MessageDigest',
      javaFactory: `
        try {
          return MessageDigest.getInstance("SHA-256");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        test(null == new MerkleTree().buildTree(), "Merkle Tree should return a null if trying to build tree without data.");

        MerkleTree_computeTreeNodes_Test();
        MerkleTree_2_Node_Test();
        MerkleTree_3_Node_Test();
        MerkleTree_4_Node_Test();
        MerkleTree_5_Node_Test();
      `
    },
    {
      name: 'getHash',
      javaReturns: 'byte[]',
      javaThrows: [
        'java.io.UnsupportedEncodingException'
      ],
      args: [
        {
          class: 'String',
          name: 'data'
        }
      ],
      javaCode: `
        return getDigest().digest(data.getBytes("UTF-8"));
      `
    },
    {
      name: 'MerkleTree_computeTreeNodes_Test',
      javaCode: `
        MerkleTree tree = new MerkleTree();

        tree.totalDataItems_ = 2;
        test(tree.computeTotalTreeNodes() == 3, "Correct number of tree nodes are being computed for N=2.");

        tree.totalDataItems_ = 3;
        test(tree.computeTotalTreeNodes() == 7, "Correct number of tree nodes are being computed for N=3.");

        tree.totalDataItems_ = 4;
        test(tree.computeTotalTreeNodes() == 7, "Correct number of tree nodes are being computed for N=4.");

        tree.totalDataItems_ = 5;
        test(tree.computeTotalTreeNodes() == 13, "Correct number of tree nodes are being computed for N=5.");

        tree.totalDataItems_ = 8;
        test(tree.computeTotalTreeNodes() == 15, "Correct number of tree nodes are being computed for N=8.");
      `
    },
    {
      name: 'MerkleTree_2_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");

          tree.addHash(node1);
          tree.addHash(node2);

          byte[][] mkTree = tree.buildTree();

          MessageDigest md = MessageDigest.getInstance("SHA-256");
          md.update(node1);
          md.update(node2);

          byte[] expected = md.digest();

          test(Hex.toHexString(mkTree[1]).equals(Hex.toHexString(node1)) &&
            Hex.toHexString(mkTree[2]).equals(Hex.toHexString(node2)), "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=2 is being built correctly.");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }`
    },
    {
      name: 'MerkleTree_3_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");
          byte[] node3 = getHash("software developer");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);

          byte[][] mkTree = tree.buildTree();

          MessageDigest md = MessageDigest.getInstance("SHA-256");
          md.update(node1);
          md.update(node2);
          byte[] intermediateLeft = md.digest();

          md.update(node3);
          md.update(node3);
          byte[] intermediateRight = md.digest();

          md.update(intermediateLeft);
          md.update(intermediateRight);
          byte[] expected = md.digest();

          test(Hex.toHexString( mkTree[3]).equals(Hex.toHexString(node1)) &&
            Hex.toHexString(mkTree[4]).equals(Hex.toHexString(node2)) &&
            Hex.toHexString(mkTree[5]).equals(Hex.toHexString(node3)) &&
            mkTree[6] == null, "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=3 is being built correctly.");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'MerkleTree_4_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");
          byte[] node3 = getHash("software");
          byte[] node4 = getHash("developer");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);
          tree.addHash(node4);

          byte[][] mkTree = tree.buildTree();

          MessageDigest md = MessageDigest.getInstance("SHA-256");
          md.update(node1);
          md.update(node2);
          byte[] intermediateLeft = md.digest();

          md.update(node3);
          md.update(node4);
          byte[] intermediateRight = md.digest();

          md.update(intermediateLeft);
          md.update(intermediateRight);
          byte[] expected = md.digest();

          test(Hex.toHexString(mkTree[3]).equals(Hex.toHexString(node1)) &&
            Hex.toHexString(mkTree[4]).equals(Hex.toHexString(node2)) &&
            Hex.toHexString(mkTree[5]).equals(Hex.toHexString(node3)) &&
            Hex.toHexString(mkTree[6]).equals(Hex.toHexString(node4)), "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=4 is being built correctly.");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'MerkleTree_5_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");
          byte[] node3 = getHash("software");
          byte[] node4 = getHash("developer");
          byte[] node5 = getHash("nanopay");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);
          tree.addHash(node4);
          tree.addHash(node5);

          byte[][] mkTree = tree.buildTree();

          MessageDigest md = MessageDigest.getInstance("SHA-256");
          md.update(node1);
          md.update(node2);
          byte[] intermediateLeftLeft = md.digest();

          md.update(node3);
          md.update(node4);
          byte[] intermediateLeftRight = md.digest();

          md.update(node5);
          md.update(node5);
          byte[] intermediateRightLeft = md.digest();

          md.update(intermediateLeftLeft);
          md.update(intermediateLeftRight);
          byte[] intermediateLeft = md.digest();

          md.update(intermediateRightLeft);
          md.update(intermediateRightLeft);
          byte[] intermediateRight = md.digest();

          md.update(intermediateLeft);
          md.update(intermediateRight);
          byte[] expected = md.digest();

          test(Hex.toHexString(mkTree[7]).equals(Hex.toHexString(node1)) &&
            Hex.toHexString(mkTree[8]).equals(Hex.toHexString(node2)) &&
            Hex.toHexString(mkTree[9]).equals(Hex.toHexString(node3)) &&
            Hex.toHexString(mkTree[10]).equals(Hex.toHexString(node4)) &&
            Hex.toHexString(mkTree[11]).equals(Hex.toHexString(node5)) &&
            mkTree[12] == null, "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=5 is being built correctly.");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
          name: 'MerkleTree_7_Node_Test',
          javaCode: `
            try {
              MerkleTree tree = new MerkleTree();

              byte[] node1 = getHash("dhiren");
              byte[] node2 = getHash("audich");
              byte[] node3 = getHash("software");
              byte[] node4 = getHash("developer");
              byte[] node5 = getHash("nanopay");

              tree.addHash(node1);
              tree.addHash(node2);
              tree.addHash(node3);
              tree.addHash(node4);
              tree.addHash(node5);

              byte[][] mkTree = tree.buildTree();

              MessageDigest md = MessageDigest.getInstance("SHA-256");
              md.update(node1);
              md.update(node2);
              byte[] intermediateLeftLeft = md.digest();

              md.update(node3);
              md.update(node4);
              byte[] intermediateLeftRight = md.digest();

              md.update(node5);
              md.update(node5);
              byte[] intermediateRightLeft = md.digest();

              md.update(intermediateLeftLeft);
              md.update(intermediateLeftRight);
              byte[] intermediateLeft = md.digest();

              md.update(intermediateRightLeft);
              md.update(intermediateRightLeft);
              byte[] intermediateRight = md.digest();

              md.update(intermediateLeft);
              md.update(intermediateRight);
              byte[] expected = md.digest();

              test(Hex.toHexString(mkTree[7]).equals(Hex.toHexString(node1)) &&
                Hex.toHexString(mkTree[8]).equals(Hex.toHexString(node2)) &&
                Hex.toHexString(mkTree[9]).equals(Hex.toHexString(node3)) &&
                Hex.toHexString(mkTree[10]).equals(Hex.toHexString(node4)) &&
                Hex.toHexString(mkTree[11]).equals(Hex.toHexString(node5)) &&
                mkTree[12] == null, "Hashes are in their correct places in the tree.");
              test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=5 is being built correctly.");
            } catch ( Throwable t ) {
              throw new RuntimeException(t);
            }
          `
        }
  ]
});
