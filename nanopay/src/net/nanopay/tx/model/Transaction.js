foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  tableColumns: [
    'status',
    'txnProcessorId',
    'payerName',
    'payeeName',
    'amount',
    'processDate',
    'completionDate',
    'date'
  ],

  imports: [
    'addCommas',
    'userDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'java.util.*',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.cico.model.TransactionType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.model.Account',
    'net.nanopay.model.BankAccount',
    'net.nanopay.tx.tp.TxnProcessor',
    'net.nanopay.tx.Transfer'
  ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      type: 'Set<TransactionStatus>',
      value: `Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
        add(TransactionStatus.REFUNDED);
        add(TransactionStatus.PENDING);
      }});`
    }
  ],

  searchColumns: [
    'id', 'status', 'type'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      label: 'Transaction ID',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.TransactionType',
      name: 'type',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.tp.TxnProcessor',
      name: 'txnProcessorId',
      label: 'Processor',
      value: 'NONE'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.tp.TxnProcessorData',
      name: 'txnProcessorData'
    },
    {
      class: 'Long',
      name: 'refundTransactionId',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'invoiceId'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: net.nanopay.tx.model.TransactionStatus.PENDING,
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: foam.u2.Visibility.RO
    },
    // TODO/REVIEW: this should just use referenceNumber
    // {
    //   class: 'Long',
    //   name: 'impsReferenceNumber',
    //   label: 'IMPS Reference Number',
    //   visibility: foam.u2.Visibility.RO
    // },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'payerId',
      label: 'Payer',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(payerId, obj, axiom) {
        this.start()
          .start('h4').style({ 'margin-bottom': 0 })
            .add(obj.payer.firstName)
          .end()
          .start('p').style({ 'margin-top': 0 }).add(obj.payer.email).end()
          .end();
      }
    },
    {
      class: 'Long',
      name: 'payeeId',
      label: 'Payee',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(payeeId, obj, axiom) {
        this.start()
              .start('h4').style({ 'margin-bottom': 0 })
                .add(obj.payee.firstName)
              .end()
              .start('p').style({ 'margin-top': 0 })
                .add(obj.payee.email)
              .end()
            .end();
      }
    },
    {
      class: 'Currency',
      name: 'amount',
      label: 'Amount',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'Currency',
      name: 'total',
      visibility: foam.u2.Visibility.RO,
      label: 'Total Amount',
      transient: true,
      expression: function(amount) {
        return amount;
      },
      javaGetter: `return getAmount();`,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        var refund =
          (X.status == net.nanopay.tx.model.TransactionStatus.REFUNDED ||
              X.type == net.nanopay.cico.model.TransactionType.REFUND );

        this
          .start()
          .addClass(refund ? 'amount-Color-Red' : 'amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      // REVIEW: how can there only be one bank account id? - used in email, but only for receiver I'm assuming.
      class: 'Reference',
      of: 'net.nanopay.model.BankAccount',
      name: 'bankAccountId',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'DateTime',
      name: 'processDate'
    },
    {
      class: 'DateTime',
      name: 'completionDate'
    },
    {
      // REVIEW: what is this - Joel
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'txnCode'
    },
    // {
    //   class: 'Currency',
    //   name: 'receivingAmount',
    //   label: 'Receiving Amount',
    //   visibility: foam.u2.Visibility.RO,
    //   transient: true,
    //   expression: function(amount, rate) {
    //     var receivingAmount = amount * rate;
    //     return receivingAmount;
    //   },
    //   tableCellFormatter: function(receivingAmount, X) {
    //     this
    //       .start({ class: 'foam.u2.tag.Image', data: 'images/india.svg' })
    //         .add(' INR ₹', X.addCommas(( receivingAmount/100 ).toFixed(2)))
    //       .end();
    //   }
    // },
    {
      class: 'String',
      name: 'challenge',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Randomly generated challenge. Used as an identifier (along with payee/payer and amount and device id) for a retail trasnaction, used in the merchant app and is transfered to the mobile applications as a property of the QrCode. Can be moved to retail Transaction.'
    },
    {
      // REVIEW: is this created date? - Joel
      class: 'DateTime',
      name: 'date',
      label: 'Date & Time'
    },
    // {
    //   class: 'Double',
    //   name: 'rate',
    //   visibility: foam.u2.Visibility.RO,
    //   tableCellFormatter: function(rate) {
    //     this.start().add(rate.toFixed(2)).end();
    //   }
    // },
    // {
    //   class: 'FObjectArray',
    //   visibility: foam.u2.Visibility.RO,
    //   name: 'feeTransactions',
    //   of: 'net.nanopay.tx.model.Transaction'
    // },
    // {
    //   class: 'FObjectArray',
    //   name: 'informationalFees',
    //   visibility: foam.u2.Visibility.RO,
    //   of: 'net.nanopay.tx.model.Fee'
    // },
    // TODO: field for tax as well? May need a more complex model for that
    {
      //class: 'FObjectProperty',
      class: 'Reference',
      of: 'net.nanopay.tx.TransactionPurpose',
      name: 'purposeId',
      label: 'Purpose',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Transaction purpose'
    },
    {
      class: 'String',
      name: 'notes',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Transaction notes'
    },
    {
      class: 'String',
      name: 'description',
      swiftName: 'description_',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'messageId'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      label: 'Latest Modify Date & Time'
    },
    {
      documentation: `Payment Platform specific data.`,
      class: 'FObjectProperty',
      name: 'paymentAccountInfo',
      of: 'net.nanopay.cico.model.PaymentAccountInfo'
    },
    {
      documentation: `For retail purposes. Tip`,
      class: 'Currency',
      name: 'tip',
      label: 'Tip',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(tip, X) {
        var formattedAmount = tip/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      documentation: `For retail purposes. DeviceId refers to the device used to display the QR code for this transaction.`,
      class: 'Reference',
      of: 'net.nanopay.retail.model.Device',
      name: 'deviceId',
      visibility: foam.u2.Visibility.RO
    }
  ],

  methods: [
    {
      name: 'isActive',
      javaReturns: 'boolean',
      javaCode: `
         return getStatus().equals(TransactionStatus.COMPLETED) || getType().equals(TransactionType.CASHOUT) ||
        getType().equals(TransactionType.NONE);
      `
    },
    {
      name: 'createTransfers',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
        // Don't perform balance transfer if status in blacklist
        if ( ! isActive() ) return new Transfer[] {};
        if ( getType() == TransactionType.CASHOUT ) {
          return new Transfer[]{
            new Transfer(getPayerId(), -getTotal())
          };
        }
        if ( getType() == TransactionType.CASHIN || getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
          return new Transfer[]{
            new Transfer(getPayeeId(), getTotal())
          };
        }
        return new Transfer[] {
            new Transfer(getPayerId(), -getTotal()),
            new Transfer(getPayeeId(),  getTotal())
        };
      `
    }
  ]
});
