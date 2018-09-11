foam.CLASS({
    package: 'net.nanopay.invoice.model',
    name: 'InvoiceTest',
    extends: 'foam.nanos.test.Test',

    javaImports: [
      'foam.core.X',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'foam.dao.MDAO',
      'net.nanopay.invoice.model.Invoice'
    ],
  
    methods: [
      {
        name: 'runTest',
        javaReturns: 'void',
        javaCode: `
        // create mock invoiceDAO
        DAO invoiceDAO = new MDAO(Invoice.getOwnClassInfo());

        // create test invoices
        Invoice invoice1 = new Invoice();

        invoice1.setId((long)1);
        invoice1.setInvoiceNumber("1");
        invoice1.setPurchaseOrder("1");
        invoice1.setAmount((long)100);
        invoice1.setPayeeId((long)1368);
        invoice1.setPayerId((long)1380);
        `
      }
    ]
  });
  