foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAO',
  extends: 'foam.dao.ProxyDAO',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          private static java.util.Map<Object, Object> locks = new java.util.concurrent.ConcurrentHashMap<>();
        `);
      }
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerator',
      name: 'receiptGenerator'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        synchronized ( locks.computeIfAbsent(obj.getProperty("id"), k -> new Object()) ) {
          try {
            // add obj to receipt generator
            net.nanopay.security.receipt.ReceiptGenerator generator = getReceiptGenerator();
            generator.add(obj);
            obj.wait();

            // generate the receipt
            net.nanopay.security.receipt.Receipt receipt = generator.generate(obj);
            System.out.println(new foam.lib.json.Outputter(foam.lib.json.OutputterMode.STORAGE).stringify(receipt));
            return super.put_(x, obj);
          } catch ( Throwable t ) {
            throw new RuntimeException(t);
          }
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
