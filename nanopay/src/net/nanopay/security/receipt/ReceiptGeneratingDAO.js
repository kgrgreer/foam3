foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Performs receipt generation on all objects that pass through this DAO.
  `,

  imports: [
    'receiptDAO'
  ],

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
          ReceiptGenerator generator = getGenerator();
          generator.add(obj);

          // store receipt in receipt DAO
          foam.dao.DAO receiptDAO = (foam.dao.DAO) getReceiptDAO();
          receiptDAO.inX(x).put(generator.generate(obj));

          return super.put_(x, obj);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
