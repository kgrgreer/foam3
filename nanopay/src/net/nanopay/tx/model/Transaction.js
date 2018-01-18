foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  imports: [
    'userDAO'
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
      name: 'status'
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
      tableCellFormatter: function(amount) {
        var formattedAmount = amount/100;
        this
          .start()
            .add(' CAD $', formattedAmount.toFixed(2))
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
      tableCellFormatter: function(receivingAmount) {
        this
          .start({ class: 'foam.u2.tag.Image', data: 'images/india.svg' })
            .add(' INR ₹', ( receivingAmount/100 ).toFixed(2))
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
      tableCellFormatter: function(total) {
        var formattedAmount = total / 100;
        this
          .start()
            .add(' CAD $', formattedAmount.toFixed(2))
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
  ]
});
