foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

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
    'net.nanopay.tx.Transfer'
  ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      type: 'Set<String>',
      value: 'Collections.unmodifiableSet(new HashSet<String>() {{ add("Refunded"); }});'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      label: 'Transaction ID',
      visibility: foam.u2.Visibility.RO
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
      value: net.nanopay.tx.model.TransactionStatus.COMPLETED,
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'impsReferenceNumber',
      label: 'IMPS Reference Number',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'payerName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'payerId',
      label: 'Payer',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(payerId, X) {
        var self = this;
        X.userDAO.find(payerId).then(function(payer) {
          self.start()
            .start('h4').style({ 'margin-bottom': 0 }).add(payer.firstName).end()
            .start('p').style({ 'margin-top': 0 }).add(payer.email).end()
          .end();
        })
      },
      postSet: function(oldValue, newValue){
        var self = this;
        var dao = this.__context__.userDAO;
        dao.find(newValue).then(function(a) {
          if ( a ) {
            self.payerName = a.label();
          } else {
            self.payerName = 'Unknown Id: ' + newValue;
          }
        });
      }
    },
    {
      class: 'String',
      name: 'payeeName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'payeeId',
      label: 'Payee',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(payeeId, X) {
        var self = this;
        X.userDAO.find(payeeId).then(function(payee) {
          self.start()
            .start('h4').style({ 'margin-bottom': 0 }).add(payee.firstName).end()
            .start('p').style({ 'margin-top': 0 }).add(payee.email).end()
          .end();
        })
      },
      postSet: function(oldValue, newValue){
        var self = this;
        var dao = this.__context__.userDAO;
        dao.find(newValue).then(function(a) {
          if ( a ) {
            self.payeeName = a.label();
          } else {
            self.payeeName = 'Unknown Id: ' + newValue;
          }
        });
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
      name: 'receivingAmount',
      label: 'Receiving Amount',
      visibility: foam.u2.Visibility.RO,
      transient: true,
      expression: function(amount, rate) {
        var receivingAmount = amount * rate;
        return receivingAmount;
      },
      tableCellFormatter: function(receivingAmount, X) {
        this
          .start({ class: 'foam.u2.tag.Image', data: 'images/india.svg' })
            .add(' INR ₹', X.addCommas(( receivingAmount/100 ).toFixed(2)))
          .end();
      }
    },
    {
      class: 'String',
      name: 'challenge',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Randomly generated challenge'
    },
    {
      class: 'DateTime',
      name: 'date',
      label: 'Date & Time'
    },
    {
      class: 'Currency',
      name: 'tip',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Double',
      name: 'rate',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(rate){
        this.start().add(rate.toFixed(2)).end()
      }
    },
    {
      class: 'FObjectArray',
      visibility: foam.u2.Visibility.RO,
      name: 'feeTransactions',
      of: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'FObjectArray',
      name: 'informationalFees',
      visibility: foam.u2.Visibility.RO,
      of: 'net.nanopay.tx.model.Fee'
    },
    // TODO: field for tax as well? May need a more complex model for that
    {
      class: 'Currency',
      name: 'total',
      visibility: foam.u2.Visibility.RO,
      label: 'Amount',
      transient: true,
      expression: function (amount, tip) {
        return amount + tip;
      },
      javaGetter: `return getAmount() + getTip();`,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        this
          .start().addClass( X.status == 'Refund' || X.status == 'Refunded' ? 'amount-Color-Red' : 'amount-Color-Green' )
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionPurpose',
      name: 'purpose',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Transaction purpose'
    },
    {
      class: 'String',
      name: 'notes',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Transaction notes'
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
        if ( getType() == TransactionType.CASHIN || getType() == TransactionType.VERIFICATION ) {
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