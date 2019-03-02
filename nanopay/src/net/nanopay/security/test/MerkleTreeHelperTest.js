foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'MerkleTreeHelperTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.io.*',
    'java.util.Arrays',
    'java.security.MessageDigest',
    'java.nio.charset.StandardCharsets',
    'org.bouncycastle.util.encoders.Hex',

    'net.nanopay.security.MerkleTree',
    'net.nanopay.security.MerkleTreeHelper',
    'net.nanopay.security.receipt.Receipt'
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
        MerkleTreeHelper_Void_Tests();
        MerkleTreeHelper_Invalid_Hash();

        MerkleTreeHelper_1_Hash_Test();
        MerkleTreeHelper_2_Hash_Test();
        MerkleTreeHelper_3_Hash_Test();
        MerkleTreeHelper_4_Hash_Test();
        MerkleTreeHelper_5_Hash_Test();
        MerkleTreeHelper_7_Hash_Test();`
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
      name: 'MerkleTreeHelper_Void_Tests',
      javaCode: `
        try {
          Receipt r = new Receipt();
          byte[][] mkTree = null;
          MerkleTreeHelper.SetPath(mkTree, getHash("void"), r);
          test(false, "IllegalArgumentException is not being thrown for null trees.");
        } catch ( Throwable t ) {
          test(true, "IllegalArgumentException is being being thrown for null trees.");
        }

        try {
          Receipt r = new Receipt();
          byte[][] mkTree = new byte[0][0];
          MerkleTreeHelper.SetPath(mkTree, getHash("empty"), r);
          test(false, "IllegalArgumentException is not being thrown for empty trees.");
        } catch ( Throwable t ) {
          test(true, "IllegalArgumentException is being being thrown for empty trees.");
        }

        try {
          Receipt r = new Receipt();
          byte[][] mkTree = new byte[1][1];
          MerkleTreeHelper.SetPath(mkTree, null, r);
          test(false, "IllegalArgumentException is not being thrown for null hashes.");
        } catch ( Throwable t ) {
          test(true, "IllegalArgumentException is being being thrown for null hashes.");
        }
      `
    },
    {
      name: 'MerkleTreeHelper_Invalid_Hash',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();

          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");

          tree.addHash(node1);
          tree.addHash(node2);

          byte[][] mkTree = tree.buildTree();

          Receipt receipt = new Receipt();

          MerkleTreeHelper.SetPath(mkTree, getHash("nanopay"), receipt);

          test(false, "Exception is not being thrown for hashes that don't exist in the tree.");
        } catch ( Throwable t ) {
          test(true, "Exception should not be thrown for hashes that don't exist in the tree.");
        }`
    },
    {
      name: 'MerkleTreeHelper_1_Hash_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();
          byte[] node1 = getHash("dhiren");

          tree.addHash(node1);

          byte[][] mkTree = tree.buildTree();
          Receipt receipt = new Receipt();

          MerkleTreeHelper.SetPath(mkTree, node1, receipt);

          test(receipt.getDataIndex() == 1, "Hashes in tree : 1 :: Correct position of the hash in the tree is being identified.");
          test(receipt.getPath().length == 1, "Hashes in tree : 1 :: Correct number of nodes are stored in the path.");
          test(Hex.toHexString(receipt.getPath()[0]).equals(Hex.toHexString(node1)), "Hashes in tree : 1 :: Path contains the correct hash.");
        } catch ( Throwable t ) {
          test(false, "Exception should not thrown for one hash in the Merkle tree.");
        }`
    },
    {
      name: 'MerkleTreeHelper_2_Hash_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();
          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");

          tree.addHash(node1);
          tree.addHash(node2);

          byte[][] mkTree = tree.buildTree();
          Receipt receipt = new Receipt();

          MerkleTreeHelper.SetPath(mkTree, node2, receipt);

          test(receipt.getDataIndex() == 2, "Hashes in tree : 2 :: Correct position of the hash in the tree is being identified.");
          test(receipt.getPath().length == 1, "Hashes in tree : 2 :: Correct number of nodes are stored in the path.");
          test(Hex.toHexString(receipt.getPath()[0]).equals(Hex.toHexString(node1)), "Hashes in tree : 2 :: Path contains the correct hash.");
        } catch ( Throwable t ) {
          test(false, "Exception should not be thrown for two hash in the Merkle tree.");
        }`
    },
    {
      name: 'MerkleTreeHelper_3_Hash_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();
          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");
          byte[] node3 = getHash("nanopay");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);

          byte[][] mkTree = tree.buildTree();
          Receipt receipt = new Receipt();

          MerkleTreeHelper.SetPath(mkTree, node3, receipt);

          test(receipt.getDataIndex() == 5, "Hashes in tree : 3 :: Correct position of the hash in the tree is being identified.");
          test(receipt.getPath().length == 2, "Hashes in tree : 3 :: Correct number of nodes are stored in the path.");
          test(Hex.toHexString(receipt.getPath()[0]).equals(Hex.toHexString(mkTree[5])) &&
            Hex.toHexString(receipt.getPath()[1]).equals(Hex.toHexString(mkTree[1])), "Hashes in tree : 3 :: Path contains the correct hashes.");
        } catch ( Throwable t ) {
          test(false, "Exception should not be thrown for three hash in the Merkle tree.");
        }`
    },
    {
      name: 'MerkleTreeHelper_4_Hash_Test',
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
          Receipt receipt = new Receipt();

          MerkleTreeHelper.SetPath(mkTree, node4, receipt);

          test(receipt.getDataIndex() == 6, "Hashes in tree : 4 :: Correct position of the hash in the tree is being identified.");
          test(receipt.getPath().length == 2, "Hashes in tree : 4 :: Correct number of nodes are stored in the path.");
          test(Hex.toHexString(receipt.getPath()[0]).equals(Hex.toHexString(mkTree[5])) &&
            Hex.toHexString(receipt.getPath()[1]).equals(Hex.toHexString(mkTree[1])), "Hashes in tree : 4 :: Path contains the correct hash.");
        } catch ( Throwable t ) {
          test(false, "Exception should not be thrown for four hash in the Merkle tree.");
        }`
    },
    {
      name: 'MerkleTreeHelper_5_Hash_Test',
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
          Receipt receipt = new Receipt();

          MerkleTreeHelper.SetPath(mkTree, node5, receipt);

          test(receipt.getDataIndex() == 11, "Hashes in tree : 5 :: Correct position of the hash in the tree is being identified.");
          test(receipt.getPath().length == 3, "Hashes in tree : 5 :: Correct number of nodes are stored in the path.");
          test(Hex.toHexString(receipt.getPath()[0]).equals(Hex.toHexString(mkTree[11])) &&
            Hex.toHexString(receipt.getPath()[1]).equals(Hex.toHexString(mkTree[5])) &&
            Hex.toHexString(receipt.getPath()[2]).equals(Hex.toHexString(mkTree[1])), "Hashes in tree : 5 :: Path contains the correct hash.");
        } catch ( Throwable t ) {
          test(false, "Exception should not be thrown for five hash in the Merkle tree.");
        }`
    },
    {
      name: 'MerkleTreeHelper_7_Hash_Test',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();
          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");
          byte[] node3 = getHash("software");
          byte[] node4 = getHash("developer");
          byte[] node5 = getHash("nanopay");
          byte[] node6 = getHash("corporation");
          byte[] node7 = getHash("canada");

          tree.addHash(node1);
          tree.addHash(node2);
          tree.addHash(node3);
          tree.addHash(node4);
          tree.addHash(node5);
          tree.addHash(node6);
          tree.addHash(node7);

          byte[][] mkTree = tree.buildTree();
          Receipt receipt = new Receipt();

          MerkleTreeHelper.SetPath(mkTree, node3, receipt);

          test(receipt.getDataIndex() == 9, "Hashes in tree : 7 :: Correct position of the hash in the tree is being identified.");
          test(receipt.getPath().length == 3, "Hashes in tree : 7 :: Correct number of nodes are stored in the path.");
          test(Hex.toHexString(receipt.getPath()[0]).equals(Hex.toHexString(mkTree[10])) &&
            Hex.toHexString(receipt.getPath()[1]).equals(Hex.toHexString(mkTree[3])) &&
            Hex.toHexString(receipt.getPath()[2]).equals(Hex.toHexString(mkTree[2])), "Hashes in tree : 7 :: Path contains the correct hash.");
        } catch ( Throwable t ) {
          test(false, "Exception should not be thrown for five hash in the Merkle tree.");
        }`
    }
  ]
});
