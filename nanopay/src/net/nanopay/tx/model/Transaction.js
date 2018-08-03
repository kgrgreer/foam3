foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  tableColumns: [
    'id',
    'status',
    'txnProcessorId',
    'payerName',
    'payeeName',
    'amount',
    'processDate',
    'completionDate',
    'date'
  ],

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'addCommas',
    'userDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
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
    'net.nanopay.tx.TransactionType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.account.Balance',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
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
      class: 'DateTime',
      name: 'created',
      documentation: `The date the invoice was created.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the invoice.`,
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: `The date the invoice was last modified.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The id of the user who last modified the invoice.`,
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.TransactionType',
      name: 'type',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
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
    {
      // REVIEW: how is this used? -only used on client for display
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      label: 'Receiver',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : '')
          .end()
        .end();
      }
    },
    {
      // REVIEW: how is this used? -only used on client for display
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      label: 'Sender',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : '')
          .end()
        .end();
      }
    },
    {
      // REVIEW: what uses this?
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      targetDAOKey: 'localAccountDAO',
      label: 'Source account',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'payeeId',
      storageTransient: true,
    },
    {
      class: 'Long',
      name: 'payerId',
      storageTransient: true,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      targetDAOKey: 'localAccountDAO',
      label: 'Destination Account',
      visibility: foam.u2.Visibility.RO
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
        this
          .start()
          .addClass('amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
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
      documentation: `Defined by ISO 20220 (Pacs008)`,
      class: 'String',
      name: 'messageId'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      value: 'CAD'
    }
  ],

  methods: [
    {
      name: 'copyTo',
      args: [
        {
          name: 'to',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaReturns: 'net.nanopay.tx.model.Transaction',
      javaCode: `
    List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( PropertyInfo p : props ) p.set(to, p.get(this));
    return to;
`
    },
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
             new Transfer((Long) getSourceAccount(), -getTotal())
          };
        }
        if ( getType() == TransactionType.CASHIN || getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
          return new Transfer[]{
            new Transfer((Long) getDestinationAccount(), getTotal())
          };
        }
        return new Transfer[] {
             new Transfer((Long) getSourceAccount(), -getTotal()),
             new Transfer((Long) getDestinationAccount(),  getTotal())
        };
      `
    }
  ]
});
