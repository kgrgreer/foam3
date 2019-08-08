foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'ReceiptSerializationTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.security.MessageDigest',
    'java.nio.charset.StandardCharsets',
    'java.util.Arrays',

    'foam.core.FObject',
    'foam.lib.json.Outputter',
    'foam.lib.StoragePropertyPredicate',
    'foam.lib.json.JSONParser',

    'net.nanopay.security.MerkleTree',
    'net.nanopay.security.MerkleTreeHelper',
    'net.nanopay.security.receipt.Receipt',
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

  constants: [
    {
      name: 'serializedJSON',
      type: 'String',
      value: '{"class":"net.nanopay.security.receipt.Receipt","path":["88fa0d759f845b47c044c2cd44e29082cf6fea665c30c146374ec7c8f3d699e3","84c0b35cb11ae3cd5b3c09f0a6e915375f328a57b6d97aa0a55afb0bf372cb61","f715d268199f7cc9a94601c761292e5ca0353158207be3e1848f2dc00d4cb148"],"dataIndex":9}'
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        try {
          MerkleTree tree = new MerkleTree();
          byte[] node1 = getHash("dhiren");
          byte[] node2 = getHash("audich");
          byte[] node3 = getHash("software");
          byte[] node4 = getHash("developer");
          byte[] node5 = getHash("nanopay");
          byte[] node6 = getHash("corporation");
          byte[] node7 = getHash("dhiren@nanopay.net");

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

          Outputter o = new Outputter(getX()).setPropertyPredicate(new StoragePropertyPredicate());

          test(serializedJSON.equals(o.stringify(receipt)), "JSON serialized correctly for the Receipt class.");

          JSONParser parser = new JSONParser();
          Receipt parsedReceipt = (Receipt) parser.parseString(o.stringify(receipt), Receipt.class);

          test(Arrays.equals(receipt.getPath()[0], parsedReceipt.getPath()[0])
            && Arrays.equals(receipt.getPath()[1], parsedReceipt.getPath()[1])
            && Arrays.equals(receipt.getPath()[2], parsedReceipt.getPath()[2]), "Receipt class was read correctly from its serialized form.");
        } catch ( Throwable t ) {
          test(false, "JSON serialization of the Receipt class failed!");
        }
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
  ]
});
