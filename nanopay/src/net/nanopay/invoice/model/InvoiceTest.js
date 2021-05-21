/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'InvoiceTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `
        // create mock invoiceDAO
        DAO invoiceDAO = new MDAO(Invoice.getOwnClassInfo());

        // create test invoice
        Invoice invoice = new Invoice();
        invoice.setId(1l);
        invoice.setInvoiceNumber("1");
        invoice.setPurchaseOrder("1");
        invoice.setAmount(100l);
        invoice.setPayeeId(1368l);
        invoice.setPayerId(1380l);

        // test for OVERDUE status
        Date date = new Date();
        date.setTime(System.currentTimeMillis() - 24*3600*1000);
        invoice.setDueDate(date);
        overdueTest(invoice, invoiceDAO);

        // test for UNPAID status
        date = new Date();
        date.setTime(System.currentTimeMillis() + 24*3600*1000);
        invoice.setDueDate(date);
        unpaidTest(invoice, invoiceDAO);

        // test for SCHEDULED status
        date = new Date();
        date.setDate(date.getDate() + 1);
        invoice.setPaymentDate(date);
        scheduledTest(invoice, invoiceDAO);

        // test for VOID status
        invoice.setPaymentMethod(PaymentStatus.VOID);
        voidTest(invoice, invoiceDAO);

        // test for PENDING status
        invoice.setPaymentMethod(PaymentStatus.PROCESSING);
        pendingTest(invoice, invoiceDAO);

        // test for PAID status
        invoice.setPaymentMethod(PaymentStatus.CHEQUE);
        paidTest(invoice, invoiceDAO);
      `
    },
    {
      name: 'overdueTest',
      args: [
        { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
        { name: 'invoiceDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        Count count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 0, "No overdue invoice");

        // create test invoices
        Invoice invoice1 = new Invoice();
        invoice1.setId(2l);
        invoice1.setInvoiceNumber("2");
        invoice1.setPurchaseOrder("2");
        invoice1.setAmount(200l);
        invoice1.setPayeeId(1368l);
        invoice1.setPayerId(1380l);
        Date date = new Date();
        date.setDate(date.getDate() - 1);
        invoice1.setDueDate(date);

        Invoice invoice2 = new Invoice();
        invoice2.setId(3l);
        invoice2.setInvoiceNumber("3");
        invoice2.setPurchaseOrder("3");
        invoice2.setAmount(200l);
        invoice2.setPayeeId(1368l);
        invoice2.setPayerId(1380l);
        invoice2.setDueDate(date);

        // tests
        invoiceDAO.put(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Put a overdue invoice");

        invoiceDAO.put(invoice2);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 2, "Put another overdue invoice");

        invoiceDAO.remove(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Removed a overdue invoice");
      `
    },
    {
      name: 'unpaidTest',
      args: [
        { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
        { name: 'invoiceDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        Count count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 0, "No overdue invoice");

        // create test invoices
        Invoice invoice1 = new Invoice();
        invoice1.setId(4l);
        invoice1.setInvoiceNumber("4");
        invoice1.setPurchaseOrder("4");
        invoice1.setAmount(200l);
        invoice1.setPayeeId(1368l);
        invoice1.setPayerId(1380l);
        Date date = new Date();
        date.setDate(date.getDate() + 1);
        invoice1.setDueDate(date);

        Invoice invoice2 = new Invoice();
        invoice2.setId(5l);
        invoice2.setInvoiceNumber("5");
        invoice2.setPurchaseOrder("5");
        invoice2.setAmount(200l);
        invoice2.setPayeeId(1368l);
        invoice2.setPayerId(1380l);
        invoice2.setDueDate(date);

        // tests
        invoiceDAO.put(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Put an unpaid invoice");

        invoiceDAO.put(invoice2);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 2, "Put another unpaid invoice");

        invoiceDAO.remove(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Removed an unpaid invoice");
      `
    },
    {
      name: 'scheduledTest',
      args: [
        { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
        { name: 'invoiceDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        Count count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 0, "No scheduled invoice");

        // create test invoices
        Invoice invoice1 = new Invoice();
        invoice1.setId(6l);
        invoice1.setInvoiceNumber("6");
        invoice1.setPurchaseOrder("6");
        invoice1.setAmount(200l);
        invoice1.setPayeeId(1368l);
        invoice1.setPayerId(1380l);
        Date date = new Date();
        date.setDate(date.getDate() + 3);
        invoice1.setPaymentDate(date);

        Invoice invoice2 = new Invoice();
        invoice2.setId(7l);
        invoice2.setInvoiceNumber("7");
        invoice2.setPurchaseOrder("7");
        invoice2.setAmount(200l);
        invoice2.setPayeeId(1368l);
        invoice2.setPayerId(1380l);
        invoice2.setPaymentDate(date);

        // tests
        invoiceDAO.put(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Put a scheduled invoice");

        invoiceDAO.put(invoice2);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 2, "Put another scheduled invoice");

        invoiceDAO.remove(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Removed a scheduled invoice");
      `
    },
    {
      name: 'voidTest',
      args: [
        { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
        { name: 'invoiceDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        Count count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 0, "No void invoice");

        // create test invoices
        Invoice invoice1 = new Invoice();
        invoice1.setId(8l);
        invoice1.setInvoiceNumber("8");
        invoice1.setPurchaseOrder("8");
        invoice1.setAmount(200l);
        invoice1.setPayeeId(1368l);
        invoice1.setPayerId(1380l);
        invoice1.setPaymentMethod(PaymentStatus.VOID);

        Invoice invoice2 = new Invoice();
        invoice2.setId(9l);
        invoice2.setInvoiceNumber("9");
        invoice2.setPurchaseOrder("9");
        invoice2.setAmount(200l);
        invoice2.setPayeeId(1368l);
        invoice2.setPayerId(1380l);
        invoice2.setPaymentMethod(PaymentStatus.VOID);

        // tests
        invoiceDAO.put(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Put a void invoice");

        invoiceDAO.put(invoice2);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 2, "Put another void invoice");

        invoiceDAO.remove(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Removed a void invoice");
      `
    },
    {
      name: 'pendingTest',
      args: [
        { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
        { name: 'invoiceDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        Count count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 0, "No pending invoice");

        // create test invoices
        Invoice invoice1 = new Invoice();
        invoice1.setId(10l);
        invoice1.setInvoiceNumber("10");
        invoice1.setPurchaseOrder("10");
        invoice1.setAmount(200l);
        invoice1.setPayeeId(1368l);
        invoice1.setPayerId(1380l);
        invoice1.setPaymentMethod(PaymentStatus.PROCESSING);

        Invoice invoice2 = new Invoice();
        invoice2.setId(11l);
        invoice2.setInvoiceNumber("11");
        invoice2.setPurchaseOrder("11");
        invoice2.setAmount(200l);
        invoice2.setPayeeId(1368l);
        invoice2.setPayerId(1380l);
        invoice2.setPaymentMethod(PaymentStatus.PROCESSING);

        // tests
        invoiceDAO.put(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Put a pending invoice");

        invoiceDAO.put(invoice2);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 2, "Put another pending invoice");

        invoiceDAO.remove(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Removed a pending invoice");
      `
    },
    {
      name: 'paidTest',
      args: [
        { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
        { name: 'invoiceDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        Count count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 0, "No paid invoice");

        // create test invoices
        Invoice invoice1 = new Invoice();
        invoice1.setId(12l);
        invoice1.setInvoiceNumber("12");
        invoice1.setPurchaseOrder("12");
        invoice1.setAmount(200l);
        invoice1.setPayeeId(1368l);
        invoice1.setPayerId(1380l);
        invoice1.setPaymentMethod(PaymentStatus.CHEQUE);

        Invoice invoice2 = new Invoice();
        invoice2.setId(13l);
        invoice2.setInvoiceNumber("13");
        invoice2.setPurchaseOrder("13");
        invoice2.setAmount(200l);
        invoice2.setPayeeId(1368l);
        invoice2.setPayerId(1380l);
        invoice2.setPaymentMethod(PaymentStatus.NANOPAY);

        // tests
        invoiceDAO.put(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Put a paid invoice");

        invoiceDAO.put(invoice2);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 2, "Put another paid invoice");

        invoiceDAO.remove(invoice1);
        count = (Count) invoiceDAO.where(MLang.EQ(Invoice.STATUS, invoice.getStatus())).select(new Count());
        test(count.getValue() == 1, "Removed a paid invoice");
      `
    }
  ]
});