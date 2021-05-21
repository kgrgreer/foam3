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
  package: 'net.nanopay.tx',
  name: 'UpdateInvoiceTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'java.util.Calendar',
    'java.util.Date',
    'java.util.HashMap',
    
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.fx.ascendantfx.AscendantFXTransaction',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.tx.alterna.CsvUtil',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  messages: [
    { name: 'INVOICE_PAID_ALREADY_ERROR_MSG', message: 'Invoice already paid' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public UpdateInvoiceTransactionDAO(X x, DAO delegate) {
            setDelegate(delegate);
            setX(x);
            setLogger((Logger) x.get("logger"));
            setLogger(new PrefixLogger(new Object[] {this.getClass().getSimpleName()}, getLogger()));
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);

        Transaction transaction = (Transaction) obj;

        // Since SaveChainedTransactionDAO will save all children transactions, we
        // can copy the invoiceId from the root transaction without having to
        // updateInvoice after the fact.
        if ( transaction.getInvoiceId() == 0
          && ( transaction instanceof CITransaction ||
              transaction instanceof COTransaction ||
              transaction instanceof FXTransaction ||
              transaction instanceof KotakPaymentTransaction ||
              transaction instanceof ComplianceTransaction )
        ) {
          transaction.setInvoiceId(getRoot(x, transaction).getInvoiceId());
          return getDelegate().put_(x, transaction);
        }

        if ( SafetyUtil.isEmpty(transaction.getId()) ||
            transaction.getInvoiceId() == 0 ||
            transaction.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED ||
            ! ( transaction instanceof CITransaction ||
                transaction instanceof COTransaction ||
                transaction instanceof FXTransaction ||
                transaction instanceof KotakPaymentTransaction ||
                transaction instanceof ComplianceTransaction ) ) {
          return getDelegate().put_(x, obj);
        }

        Transaction old = (Transaction) getDelegate().find(transaction.getId());
        if ( ! ( transaction instanceof AbliiTransaction ) &&
            ( old == null ||
              old.getStatus() == transaction.getStatus() ) ) {
          return getDelegate().put_(x, obj);
        }

        Invoice invoice = getInvoice(x, transaction);
        if ( invoice == null ) return getDelegate().put_(x, obj);
        if ( transaction.getStatus() == TransactionStatus.SENT &&
            transaction instanceof COTransaction ) {
            // only update the estimated completion date on the last CO leg.
          invoice.setPaymentDate(transaction.getCompletionDate());
          invoiceDAO.put(invoice);
          //getLogger().debug(transaction.getId(), transaction.getType(), transaction.getStatus(), state, transaction.getInvoiceId(), "SENT/PENDING");
          return getDelegate().put_(x, obj);
        } else {
          // The remainder test 'state' which is only valid after the
          // transactions completes put().
          transaction = (Transaction) getDelegate().put_(x, obj);

          // With FastPay getState must be called on root to handle
          // composite transactions with CO and CI. Only COMPLETED
          // when both are COMPLETED, for example.
          TransactionStatus state = getRoot(x, transaction).getState(getX());

          if ( state != null &&
              state == TransactionStatus.COMPLETED &&
              invoice.getStatus() == InvoiceStatus.PAID ) {
            getLogger().warning("Transaction", transaction.getId(), "invoice", invoice.getId(), "already PAID");
            throw new RuntimeException(INVOICE_PAID_ALREADY_ERROR_MSG);
          } else if ( state == TransactionStatus.DECLINED ||
                      state == TransactionStatus.REVERSE ||
                      state == TransactionStatus.REVERSE_FAIL ) {
            getLogger().debug(transaction.getId(), transaction.getType(), transaction.getStatus(), state, transaction.getInvoiceId(), "DECLINED");
            // Do nothing. Our team will investigate and then manually set the status of the invoice.

            HashMap<String, Object> args = new HashMap();
            args.put("transactionId", transaction.getId());
            args.put("invoiceId", invoice.getId());
            invoice.clearPaymentMethod();
            invoice.clearPaymentDate();
            invoiceDAO.put(invoice);

            // Send a notification to the payment-ops team.
            FailedTransactionNotification notification = new FailedTransactionNotification.Builder(x)
              .setTransactionId(transaction.getId())
              .setInvoiceId(invoice.getId())
              .setEmailArgs(args)
              .setGroupId(transaction.getSpid() + "-payment-ops")
              .build();
            DAO notificationDAO = ((DAO) x.get("localNotificationDAO")).inX(x);
            notificationDAO.put(notification);
          } else if ( state == TransactionStatus.COMPLETED ) {
            Calendar curDate = Calendar.getInstance();
            invoice.setPaymentDate(curDate.getTime());
            invoice.setPaymentMethod(PaymentStatus.NANOPAY);
            invoiceDAO.put(invoice);
            // getLogger().debug(transaction.getId(), transaction.getType(), transaction.getStatus(), state, transaction.getInvoiceId(), "COMPLETED/PAID");
          }
          return transaction;
        }
      `
    },
    {
      name: 'getInvoice',
      type: 'Invoice',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'transaction' }
      ],
      javaCode: `
        DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
        Invoice invoice = transaction.findInvoiceId(x);
        if ( invoice == null ) {
          // TODO: create notification
          String notificationMsg = "Transaction " + transaction.getId() + ", invoice " + transaction.getInvoiceId() + " not found.";
          getLogger().error(notificationMsg);
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody(notificationMsg)
            .build();
          ((DAO) x.get("localNotificationDAO")).put(notification);
        }
        return invoice;
      `
    },
    {
      name: 'generateEstimatedCreditDate',
      visibility: 'protected',
      type: 'Date',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'txn' }
      ],
      javaCode: `
        // NOTE: Alterna specific
        // CI + CO
        return CsvUtil.generateCompletionDate(x, CsvUtil.generateCompletionDate(x, new Date()));
      `
    },
    {
      name: 'getRoot',
      type: 'Transaction',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Transaction', name: 'transaction' }
      ],
      javaCode: `
        Transaction txn = transaction;
        Transaction parent = txn;
        while ( txn != null ) {
          parent = txn;
          txn = (Transaction) parent.findParent(x);
        }
        return parent;
      `
    }
  ]
});
