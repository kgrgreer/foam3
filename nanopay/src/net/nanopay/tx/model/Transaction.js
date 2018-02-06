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
    'net.nanopay.cico.model.TransactionStatus',
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
      label: 'Transaction ID'
    },
    {
      class: 'Long',
      name: 'refundTransactionId'
    },
    {
      class: 'Long',
      name: 'invoiceId'
    },
    {
      class: 'String',
      name: 'status',
      value: 'Completed'
    },
    {
      class: 'String',
      name: 'referenceNumber'
    },
    {
      class: 'Long',
      name: 'impsReferenceNumber',
      label: 'IMPS Reference Number'
    },
    {
      class: 'String',
      name: 'payerName'
    },
    {
      class: 'Long',
      name: 'payerId',
      label: 'Payer',
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
      name: 'payeeName'
    },
    {
      class: 'Long',
      name: 'payeeId',
      label: 'Payee',
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
      documentation: 'Randomly generated challenge'
    },
    {
      class: 'DateTime',
      name: 'date',
      label: 'Date & Time'
    },
    {
      class: 'Currency',
      name: 'tip'
    },
    {
      class: 'Double',
      name: 'rate',
      tableCellFormatter: function(rate){
        this.start().add(rate.toFixed(2)).end()
      }
    },
    {
      class: 'FObjectArray',
      name: 'feeTransactions',
      of: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'FObjectArray',
      name: 'informationalFees',
      of: 'net.nanopay.tx.model.Fee'
    },
    // TODO: field for tax as well? May need a more complex model for that
    {
      class: 'Currency',
      name: 'total',
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
      documentation: 'Transaction purpose'
    },
    {
      class: 'String',
      name: 'notes',
      documentation: 'Transaction notes'
    }
  ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
        // Don't perform balance transfer if status in blacklist
        if ( STATUS_BLACKLIST.contains(getStatus()) ) return new Transfer[] {};

        return new Transfer[] {
            new Transfer(getPayerId(), -getTotal()),
            new Transfer(getPayeeId(),  getTotal())
        };
      `
    }
  ]
});
