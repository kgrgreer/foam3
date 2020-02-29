/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.invoice.test',
  name: 'invoiceHistoryAuthorizerTest',
  extends: 'foam.nanos.test.Test',
  flags: ['java'],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.history.HistoryRecord',
    'foam.dao.SequenceNumberDAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.test.Test',
    'foam.test.TestUtils',
    'java.util.Date',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',
    'static foam.mlang.MLang.*',
  ],

  documentation: 'Class to test invoiceHistoryDAO security',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x = x.put("user", null)
             .put("group", null)
             .put("twoFactorSuccess", false);
        User payerUser = new User();
        User payeeUser = new User();
        User unrelatedUser = new User();
        User adminUser = new User();
        DAO invoiceHistoryDAO = ((DAO) x.get("invoiceHistoryDAO")).inX(x);
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");
        DAO bareUserDAO = (DAO) x.get("bareUserDAO");
        Invoice invoice = new Invoice();
        HistoryRecord historyRecord = null;
        boolean threw;

        payerUser.setId(1);
        payeeUser.setId(2);
        unrelatedUser.setId(3);
        adminUser.setGroup("admin");

        x = x.put("user", adminUser);

        payeeUser = (User) bareUserDAO.put(payeeUser);

        invoice.setPayeeId(payeeUser.getId());
        invoice.setPayerId(payerUser.getId());
        invoice = (Invoice) invoiceDAO.put(invoice);

        historyRecord = (HistoryRecord) ((ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, invoice.getId())
        ).select(new ArraySink())).getArray().get(0);

        x = x.put("user", payerUser);

        ArraySink invoiceHistoryTestSink = (ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, invoice.getId())
        ).select(new ArraySink());

        test(invoiceHistoryTestSink.getArray().size() == 1 , "Users can view the invoice history for invoices where they are the payee.");

        x = x.put("user", payeeUser);
        invoiceHistoryTestSink = (ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, invoice.getId())
        ).select(new ArraySink());

        test(invoiceHistoryTestSink.getArray().size() == 1 , "Users can view the invoice history for invoices where they are the payer.");

        x = x.put("user", unrelatedUser);
        invoiceHistoryTestSink = (ArraySink) invoiceHistoryDAO.inX(x).select(new ArraySink());

        test(invoiceHistoryTestSink.getArray().size() == 0, "Users cannot view the history of invoices that they are not the payee or payer of.");

        threw = false;
        try {
          historyRecord = (HistoryRecord) invoiceHistoryDAO.inX(x).put(historyRecord);
        } catch ( AuthorizationException e ) {
          threw = true;
        }

        test(threw , "Non Admin/System group user can't update HistoryRecord in invoiceHistroyDAO");

        threw = false;
        try {
          invoiceHistoryDAO.inX(x).remove(historyRecord);
        } catch ( AuthorizationException e ) {
          threw = true;
        }

        test(threw, "Non Admin/System group user can't delete HistoryRecord from invoiceHistroyDAO");

        threw = false;
        HistoryRecord historyRecord1 = new HistoryRecord();
        try {
          invoiceHistoryDAO.inX(x).put(historyRecord1);
        } catch ( AuthorizationException e ) {
          threw = true;
        }

        test(threw, "Non Admin/System group user can't add HistoryRecord to invoiceHistroyDAO");

        x = x.put("user", adminUser);
        threw = false;
        try {
          invoiceHistoryDAO.inX(x).remove(historyRecord1);
        } catch ( AuthorizationException e) {
          threw = true;
        }

        test(! threw, "Admin user can delete historyRecord");

        threw = false;
        try {
          invoiceHistoryDAO.inX(x).put(historyRecord1);
        } catch ( AuthorizationException e) {
          threw = true;
        }
        test(! threw, "Admin user can add history record to invoiceHistoryDAO");

        threw = false;
        try {
          invoiceHistoryDAO.inX(x).inX(x).put(historyRecord1);
        } catch ( AuthorizationException e ) {
          threw = true;
        }

        test(! threw, "Admin user can update invoiceHistoryDAO");
      `
    },
  ]
});
