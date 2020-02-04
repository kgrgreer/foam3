foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'MerkleTreeTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.security.MessageDigest',
    'net.nanopay.security.MerkleTree',
    'net.nanopay.security.MerkleTreeHelper',
    'org.bouncycastle.util.encoders.Hex'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
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

            public void setDefaultSize(int size) {
              defaultSize_ = size;
            }

            public byte[][] getData() {
              return data_;
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
    },
    {
      class: 'Int',
      name: 'hashArrayLength',
      javaFactory: `
        try {
          return getHash("dhiren audich").length;
        } catch (Throwable t) {
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
        MerkleTree_6_Node_Test();
        MerkleTree_7_Node_Test();
        MerkleTree_12_Node_Test();
        MerkleTree_36_Node_Test();
        MerkleTree_Previous_Root_Test();
        MerkleTree_Default_Size_Test();
      `
    },
    {
      name: 'getHash',
      type: 'Byte[]',
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
      name: 'getParentHashes',
      documentation: `Returns the hashes for the parent nodes for the given
        child nodes. The length of the child nodes must be even.`,
      type: 'Byte[][]',
      args: [
        {
          class: 'Object',
          type: 'Byte[][]',
          name: 'children'
        }
      ],
      javaThrows: [
        'java.security.NoSuchAlgorithmException'
      ],
      javaCode: `
        byte[][] parent = new byte[children.length / 2][children[0].length];
        int parentCount = 0;
        MessageDigest md = MessageDigest.getInstance("SHA-256");

        for ( int i = 0; i + 1 < children.length; i += 2 ){
          md.update(children[i]);
          md.update(children[i + 1]);

          parent[parentCount] = md.digest();
          parentCount++;
        }

        return parent;
      `
    },
    {
      name: 'MerkleTree_computeTreeNodes_Test',
      javaCode: `
        TestMerkleTree tree = new TestMerkleTree();
        double totalNodes = Math.pow(2, 0) + Math.pow(2, 1);

        tree.setSize(2);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=2.");

        tree.setSize(3);
        totalNodes += Math.pow(2, 2);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=3.");

        tree.setSize(4);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=4.");

        tree.setSize(5);
        totalNodes += Math.pow(2, 3);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=5.");

        tree.setSize(6);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=6.");

        tree.setSize(8);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=8.");

        tree.setSize(10);
        totalNodes += Math.pow(2, 4);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=10.");

        tree.setSize(24);
        totalNodes += Math.pow(2, 5);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=24.");

        tree.setSize(36);
        totalNodes += Math.pow(2, 6);
        test(tree.computeTotalTreeNodes() == totalNodes, "Correct number of tree nodes are being computed for N=36.");
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
            Hex.toHexString(mkTree[2]).equals(Hex.toHexString(node1)), "Hashes are in their correct places in the tree.");
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

          byte[][] testNodes = new byte[2][getHashArrayLength()];
          testNodes[0] = getHash("dhiren");
          testNodes[1] = getHash("audich");

          tree.addHash(testNodes[0]);
          tree.addHash(testNodes[1]);

          byte[][] mkTree = tree.buildTree();

          byte[] expected = getParentHashes(testNodes)[0];

          test(Hex.toHexString(mkTree[1]).equals(Hex.toHexString(testNodes[0])) &&
            Hex.toHexString(mkTree[2]).equals(Hex.toHexString(testNodes[1])), "Hashes are in their correct places in the tree.");
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

          byte[][] testNodes = new byte[4][getHashArrayLength()];
          testNodes[0] = getHash("dhiren");
          testNodes[1] = getHash("audich");
          testNodes[2] = getHash("software developer");
          testNodes[3] = getHash("software developer");

          tree.addHash(testNodes[0]);
          tree.addHash(testNodes[1]);
          tree.addHash(testNodes[2]);

          byte[][] mkTree = tree.buildTree();

          byte[] expected = getParentHashes(getParentHashes(testNodes))[0];

          test(Hex.toHexString( mkTree[3]).equals(Hex.toHexString(testNodes[0])) &&
            Hex.toHexString(mkTree[4]).equals(Hex.toHexString(testNodes[1])) &&
            Hex.toHexString(mkTree[5]).equals(Hex.toHexString(testNodes[2])) &&
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

          byte[][] testNodes = new byte[4][getHashArrayLength()];
          testNodes[0] = getHash("dhiren");
          testNodes[1] = getHash("audich");
          testNodes[2] = getHash("software");
          testNodes[3] = getHash("developer");

          tree.addHash(testNodes[0]);
          tree.addHash(testNodes[1]);
          tree.addHash(testNodes[2]);
          tree.addHash(testNodes[3]);

          byte[][] mkTree = tree.buildTree();

          byte[] expected = getParentHashes(getParentHashes(testNodes))[0];

          test(Hex.toHexString(mkTree[3]).equals(Hex.toHexString(testNodes[0])) &&
            Hex.toHexString(mkTree[4]).equals(Hex.toHexString(testNodes[1])) &&
            Hex.toHexString(mkTree[5]).equals(Hex.toHexString(testNodes[2])) &&
            Hex.toHexString(mkTree[6]).equals(Hex.toHexString(testNodes[3])), "Hashes are in their correct places in the tree.");
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
      name: 'MerkleTree_6_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");
          byte[] node3 = getHash("software");
          byte[] node4 = getHash("developer");
          byte[] node5 = getHash("nanopay");
          byte[] node6 = getHash("canada");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);
          tree.addHash(node4);
          tree.addHash(node5);
          tree.addHash(node6);

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
            Hex.toHexString(mkTree[12]).equals(Hex.toHexString(node6)) &&
            mkTree[6] == null, "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=6 is being built correctly.");
        } catch ( Throwable t ) {
          test(false, "Merkle tree failed to build correctly with N=6.");
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
    },
    {
      name: 'MerkleTree_12_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("beauty");
          byte[] node2 = getHash("queen");
          byte[] node3 = getHash("of");
          byte[] node4 = getHash("only");
          byte[] node5 = getHash("eighteen");
          byte[] node6 = getHash("she");
          byte[] node7 = getHash("had");
          byte[] node8 = getHash("some");
          byte[] node9 = getHash("trouble");
          byte[] node10 = getHash("with");
          byte[] node11 = getHash("herself");
          byte[] node12 = getHash("he");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);
          tree.addHash(node4);
          tree.addHash(node5);
          tree.addHash(node6);
          tree.addHash(node7);
          tree.addHash(node8);
          tree.addHash(node9);
          tree.addHash(node10);
          tree.addHash(node11);
          tree.addHash(node12);

          byte[][] mkTree = tree.buildTree();

          MessageDigest md = MessageDigest.getInstance("SHA-256");
          md.update(node1);
          md.update(node2);
          byte[] intermediateLeftLeftLeft = md.digest();

          md.update(node3);
          md.update(node4);
          byte[] intermediateLeftLeftRight = md.digest();

          md.update(intermediateLeftLeftLeft);
          md.update(intermediateLeftLeftRight);
          byte[] intermediateLeftLeft = md.digest();

          md.update(node5);
          md.update(node6);
          byte[] intermediateLeftRightLeft = md.digest();

          md.update(node7);
          md.update(node8);
          byte[] intermediateLeftRightRight = md.digest();

          md.update(intermediateLeftRightLeft);
          md.update(intermediateLeftRightRight);
          byte[] intermediateLeftRight = md.digest();

          md.update(intermediateLeftLeft);
          md.update(intermediateLeftRight);
          byte[] intermediateLeft = md.digest();

          md.update(node9);
          md.update(node10);
          byte[] intermediateRightLeftLeft = md.digest();

          md.update(node11);
          md.update(node12);
          byte[] intermediateRightLeftRight = md.digest();

          md.update(intermediateRightLeftLeft);
          md.update(intermediateRightLeftRight);
          byte[] intermediateRightLeft = md.digest();

          md.update(intermediateRightLeft);
          md.update(intermediateRightLeft);
          byte[] intermediateRight = md.digest();

          md.update(intermediateLeft);
          md.update(intermediateRight);
          byte[] expected = md.digest();

          test(Hex.toHexString(mkTree[15]).equals(Hex.toHexString(node1)) &&
                      Hex.toHexString(mkTree[16]).equals(Hex.toHexString(node2)) &&
                      Hex.toHexString(mkTree[17]).equals(Hex.toHexString(node3)) &&
                      Hex.toHexString(mkTree[18]).equals(Hex.toHexString(node4)) &&
                      Hex.toHexString(mkTree[19]).equals(Hex.toHexString(node5)) &&
                      Hex.toHexString(mkTree[20]).equals(Hex.toHexString(node6)) &&
                      Hex.toHexString(mkTree[21]).equals(Hex.toHexString(node7)) &&
                      Hex.toHexString(mkTree[22]).equals(Hex.toHexString(node8)) &&
                      Hex.toHexString(mkTree[23]).equals(Hex.toHexString(node9)) &&
                      Hex.toHexString(mkTree[24]).equals(Hex.toHexString(node10)) &&
                      Hex.toHexString(mkTree[25]).equals(Hex.toHexString(node11)) &&
                      Hex.toHexString(mkTree[26]).equals(Hex.toHexString(node12)) &&
                      mkTree[6] == null, "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=12 is being built correctly.");
        } catch ( Throwable t ) {
          test(false, "Merkle tree failed to build correctly with N=12.");
        }`
    },
    {
      name: 'MerkleTree_36_Node_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          String loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus, ipsum eu cursus pharetra, leo mauris ullamcorper ex, id euismod magna leo tincidunt nisl. Cras nec dictum mauris. Vivamus porttitor quis nisl id euismod. Phasellus varius.";
          String[] words = loremIpsum.split("\\\\s+");

          byte[][] testNodes = new byte[36][getHashArrayLength()];

          for ( int i = 0; i < words.length; i++ ){
            testNodes[i] = getHash(words[i]);
            tree.addHash(testNodes[i]);
          }

          byte[][] mkTree = tree.buildTree();

          byte[][] level1 = getParentHashes(testNodes);

          byte[][] level2 = new byte[(int) Math.ceil((double)level1.length / 2.0) + 1][getHashArrayLength()];
          int count = 0;
          for ( byte[] hash : getParentHashes(level1) ) {
            level2[count] = hash;
            count++;
          }
          level2[count] = level2[count - 1];

          byte[][] level3 = new byte[(int) Math.ceil((double)level2.length / 2.0) + 1][getHashArrayLength()];
          count = 0;
          for ( byte[] hash : getParentHashes(level2) ) {
            level3[count] = hash;
            count++;
          }
          level3[count] = level3[count - 1];

          byte[][] level4 = new byte[(int) Math.ceil((double)level3.length / 2.0) + 1][getHashArrayLength()];
          count = 0;
          for ( byte[] hash : getParentHashes(level3) ) {
            level4[count] = hash;
            count++;
          }
          level4[count] = level4[count - 1];

          byte[][] level5 = new byte[level4.length / 2][getHashArrayLength()];
          count = 0;
          for ( byte[] hash : getParentHashes(level4) ) {
            level5[count] = hash;
            count++;
          }

          byte[] expected = getParentHashes(level5)[0];

          test(mkTree[6] == null &&
            mkTree[12] == null &&
            mkTree[24] == null &&
            mkTree[49] == null &&
            mkTree[99] == null &&
            Hex.toHexString(mkTree[4]).equals(Hex.toHexString(level4[1])) &&
            Hex.toHexString(mkTree[5]).equals(Hex.toHexString(level4[2])) &&
            Hex.toHexString(mkTree[63]).equals(Hex.toHexString(testNodes[0])) &&
            Hex.toHexString(mkTree[80]).equals(Hex.toHexString(testNodes[17])), "Hashes are in their correct places in the tree.");
          test(Hex.toHexString(mkTree[0]).equals(Hex.toHexString(expected)), "Merkle tree with N=36 is being built correctly.");
        } catch ( Throwable t ) {
          test(false, "Merkle tree failed to build correctly with N=36. " + t);
        }
      `
    },
    {
      name: 'MerkleTree_Previous_Root_Test',
      javaCode: `
      TestMerkleTree tree = new TestMerkleTree();
      try {
        tree.addHash(getHash("kristina"));
        tree.addHash(getHash("smirnova"));
      } catch (Exception e) {
        test(false, "MerkleTree_Previous_Root_Test: failed to addHash. Message: " + e.getMessage());
      }
      byte[][] builtTree = tree.buildTree();

      try {
        tree.addHash(getHash("twinkle twinkle"));
        tree.addHash(getHash("little star"));
        tree.addHash(getHash("like a diamond in the sky"));
      } catch (Exception e) {
        test(false, "MerkleTree_Previous_Root_Test: failed to addHash. Message: " + e.getMessage());
      }

      byte[][] builtTree2 = tree.buildTree();
      test(MerkleTreeHelper.FindHashIndex(builtTree2, builtTree[0]) != -1, "Second tree contains the root of the first tree.");
      `
    },
    {
      name: 'MerkleTree_Default_Size_Test',
      javaCode: `
      int treeSize = 100;
      TestMerkleTree tree = new TestMerkleTree();

      tree.setDefaultSize(treeSize);

      try {
        for ( int i = 0; i < 3*treeSize+1; i++ ) {
          tree.addHash(getHash("s"));
        }
      } catch (Exception e) {
        test(false, "MerkleTree_Default_Size_Test: failed to addHash. Message: " + e.getMessage());
      }
      test(SafetyUtil.equals(tree.getData().length, treeSize * 4), "Length of 'data_' increases by 'defaultsize' as it becomes full.");
      `
    }
  ]
});
