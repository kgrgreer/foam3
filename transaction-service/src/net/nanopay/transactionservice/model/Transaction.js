foam.CLASS({
  package: 'net.nanopay.transactionservice.model',
  name: 'Transaction',

  imports: [
    'userDAO'
  ],

  exports: [
    'payNow'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
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
      name: 'payerId'
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
      }
    },
    {
      class: 'Currency',
      name: 'amount',
      label: 'Sending Amount',
      tableCellFormatter: function(amount) {
        this.start({ class: 'foam.u2.tag.Image', data: 'images/canada.svg' })
            .add(' CAD ', ( amount/100 ).toFixed(2))
      },
    },
    {
      class: 'Currency',
      name: 'receivingAmount',
      label: 'Receiving Amount',
      transient: true,
      expression: function(amount, fees, rate) {
        var receivingAmount = (amount - fees) * rate;
        return receivingAmount;
      },
      tableCellFormatter: function(receivingAmount) {
        this.start({ class: 'foam.u2.tag.Image', data: 'images/india.svg' })
            .add(' INR ', ( receivingAmount/100 ).toFixed(2))
      }
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
      class: 'Currency',
      name: 'fees',
      tableCellFormatter: function(fees){
        this.start().add('$', fees.toFixed(2)).end()
      }
    },
    // TODO: field for tax as well? May need a more complex model for that
    {
      class: 'Currency',
      name: 'total',
      expression: function (amount, tip, fees) {
        return amount + tip + fees;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.transactionservice.model.TransactionPurpose',
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
