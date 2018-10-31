foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerator',
      name: 'generator'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerationPolicy',
      name: 'policy'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        try {
          net.nanopay.security.receipt.ReceiptGenerator generator = getGenerator();
          net.nanopay.security.receipt.ReceiptGenerationPolicy policy = getPolicy();

          // update generate and policy
          generator.add(obj);
          policy.update(obj);

          // generate the receipt
          net.nanopay.security.receipt.Receipt receipt = generator.generate(obj);
          System.out.println(new foam.lib.json.Outputter(foam.lib.json.OutputterMode.STORAGE).stringify(receipt));
          return super.put_(x, obj);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return super.remove_(x, obj);
      `
    }
  ]
});
