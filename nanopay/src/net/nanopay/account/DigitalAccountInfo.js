foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccountInfo',
  ids: ['accountId'],
  imports: [ 'addCommas'],

  properties: [
    {
      class: 'Long',
      name: 'accountId',
    }, 
    {
      class: 'Long',
      name: 'balance',
      tableCellFormatter: function(amount, X) {        
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'String',
      name: 'owner',
    }, 
    {
      class: 'String',
      name: 'currency',
    }, 
    {
      class: 'Long',
      name: 'transactionsRecieved',
      label: 'Recieved #'
    }, 
    {
      class: 'Long',
      name: 'transactionsSent',
      label: 'Sent #'

    },
    {
      class: 'Double',
      name: 'transactionsSumRecieved',
      label: 'Recieved Amount',
      tableCellFormatter: function(amount, X) {        
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }

    }, 
    {
      class: 'Double',
      name: 'transactionsSumSent',
      label: 'Sent Amount',
      tableCellFormatter: function(amount, X) {        
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }

    },
  ]
});