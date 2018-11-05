foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerator',
      name: 'generator'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        try {
          generator_.add(obj);

          // TODO: store generated receipt somewhere
          Receipt receipt = generator_.generate(obj);

          return super.put_(x, obj);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
