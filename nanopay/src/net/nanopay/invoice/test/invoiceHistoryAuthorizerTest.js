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

/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.invoice.test',
  name: 'invoiceHistoryAuthorizerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.SequenceNumberDAO',
    'foam.dao.history.HistoryRecord',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.test.Test',
    'foam.test.TestUtils',
    'foam.util.Auth',

    'java.util.Date',

    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',

    'static foam.mlang.MLang.*'
  ],

  documentation: 'Class to test invoiceHistoryDAO security',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        Subject subject = new Subject.Builder(x).setUser(null).build();
        x = x.put("subject", subject)
             .put("group", null)
             .put("twoFactorSuccess", false);
        User payerUser = new User();
        User payeeUser = new User();
        User unrelatedUser = new User();
        User adminUser = new User();
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");
        DAO invoiceHistoryDAO = ((DAO) x.get("invoiceHistoryDAO")).inX(x);
        DAO bareUserDAO = ((DAO) x.get("bareUserDAO"));
        Invoice invoice = new Invoice();
        HistoryRecord historyRecord = null;
        boolean threw;

        adminUser.setGroup("admin");

        adminUser = (User) bareUserDAO.put(adminUser);

        x = Auth.sudo(x, adminUser);

        payeeUser = (User) bareUserDAO.put(payeeUser);
        payerUser = (User) bareUserDAO.put(payerUser);
        unrelatedUser = (User) bareUserDAO.put(unrelatedUser);

        invoice.setPayeeId(payeeUser.getId());
        invoice.setPayerId(payerUser.getId());
        invoice.setAmount(1000);
        invoice = (Invoice) invoiceDAO.put(invoice);

        historyRecord = (HistoryRecord) ((ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, invoice.getId())
        ).select(new ArraySink())).getArray().get(0);

        x = Auth.sudo(x, payerUser);

        ArraySink invoiceHistoryTestSink = (ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, invoice.getId())
        ).select(new ArraySink());

        test(invoiceHistoryTestSink.getArray().size() == 1 , "Users can view the invoice history for invoices where they are the payee.");

        x = Auth.sudo(x, payeeUser);
        invoiceHistoryTestSink = (ArraySink) invoiceHistoryDAO.inX(x).where(
          EQ(HistoryRecord.OBJECT_ID, invoice.getId())
        ).select(new ArraySink());

        test(invoiceHistoryTestSink.getArray().size() == 1 , "Users can view the invoice history for invoices where they are the payer.");

        x = Auth.sudo(x, unrelatedUser);
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

        x = Auth.sudo(x, adminUser);
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
          invoiceHistoryDAO.inX(x).put(historyRecord1);
        } catch ( AuthorizationException e ) {
          threw = true;
        }

        test(! threw, "Admin user can update invoiceHistoryDAO");
        DAO localUserDAO = (DAO) x.get("localUserDAO");
      `
    }
  ]
});
