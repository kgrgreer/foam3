foam.CLASS({
  package: 'net.nanopay.security.test',
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

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          /**
           * Helper class that allows direct editing of size
           */
          public class TestMerkleTree
            extends MerkleTree
          {
            public int getSize() {
              return size_;
            }

            public void setSize(int size) {
              size_ = size;
            }

            @Override
            protected int computeTotalTreeNodes() {
              return super.computeTotalTreeNodes();
            }
          }
        `);
      }
    }
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
        try {
          test(null == new MerkleTree().buildTree(), "Merkle Tree should return a null if trying to build tree without data.");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        MerkleTree_computeTreeNodes_Test();
        MerkleTree_1_Node_Test();
        MerkleTree_2_Node_Test();
        MerkleTree_3_Node_Test();
        MerkleTree_4_Node_Test();
        MerkleTree_5_Node_Test();
        MerkleTree_7_Node_Test();
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
        TestMerkleTree tree = new TestMerkleTree();

        tree.setSize(2);
        test(tree.computeTotalTreeNodes() == 3, "Correct number of tree nodes are being computed for N=2.");

        tree.setSize(3);
        test(tree.computeTotalTreeNodes() == 7, "Correct number of tree nodes are being computed for N=3.");

        tree.setSize(4);
        test(tree.computeTotalTreeNodes() == 7, "Correct number of tree nodes are being computed for N=4.");

        tree.setSize(5);
        test(tree.computeTotalTreeNodes() == 13, "Correct number of tree nodes are being computed for N=5.");

        tree.setSize(8);
        test(tree.computeTotalTreeNodes() == 15, "Correct number of tree nodes are being computed for N=8.");
      `
    },
    {
      name: 'MerkleTree_1_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("dhiren audich");

          tree.addHash(node1);

          byte[][] mkTree = tree.buildTree();

          MessageDigest md = MessageDigest.getInstance("SHA-256");
          md.update(node1);
          md.update(node1);

          byte[] expected = md.digest();

          test(Hex.toHexString(mkTree[1]).equals(Hex.toHexString(node1)) &&
            mkTree[2] == null, "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=1 is being built correctly.");
        } catch ( Throwable t ) {
          test(false, "Merkle tree failed to build correctly with N=1.");
        }`
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
          test(false, "Merkle tree failed to build correctly with N=2.");
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
          test(false, "Merkle tree failed to build correctly with N=3.");
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
          test(false, "Merkle tree failed to build correctly with N=4.");
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
          test(false, "Merkle tree failed to build correctly with N=5.");
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
          byte[] node6 = getHash("corporation");
          byte[] node7 = getHash("121 East Liberty Street");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);
          tree.addHash(node4);
          tree.addHash(node5);
          tree.addHash(node6);
          tree.addHash(node7);

          byte[][] mkTree = tree.buildTree();

          MessageDigest md = MessageDigest.getInstance("SHA-256");
          md.update(node1);
          md.update(node2);
          byte[] intermediateLeftLeft = md.digest();

          md.update(node3);
          md.update(node4);
          byte[] intermediateLeftRight = md.digest();

          md.update(node5);
          md.update(node6);
          byte[] intermediateRightLeft = md.digest();

          md.update(node7);
          md.update(node7);
          byte[] intermediateRightRight = md.digest();

          md.update(intermediateLeftLeft);
          md.update(intermediateLeftRight);
          byte[] intermediateLeft = md.digest();

          md.update(intermediateRightLeft);
          md.update(intermediateRightRight);
          byte[] intermediateRight = md.digest();

          md.update(intermediateLeft);
          md.update(intermediateRight);
          byte[] expected = md.digest();

          test(Hex.toHexString(mkTree[7]).equals(Hex.toHexString(node1)) &&
            Hex.toHexString(mkTree[8]).equals(Hex.toHexString(node2)) &&
            Hex.toHexString(mkTree[9]).equals(Hex.toHexString(node3)) &&
            Hex.toHexString(mkTree[10]).equals(Hex.toHexString(node4)) &&
            Hex.toHexString(mkTree[11]).equals(Hex.toHexString(node5)) &&
            Hex.toHexString(mkTree[12]).equals(Hex.toHexString(node6)) &&
            Hex.toHexString(mkTree[13]).equals(Hex.toHexString(node7)) &&
            mkTree[14] == null, "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=7 is being built correctly.");
        } catch ( Throwable t ) {
          test(false, "Merkle tree failed to build correctly with N=7.");
        }`
    }
  ]
});
