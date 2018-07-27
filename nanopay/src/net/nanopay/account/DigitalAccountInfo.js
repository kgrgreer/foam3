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
    }, 
    {
      class: 'Long',
      name: 'transactionsSent',
    },
    {
      class: 'Double',
      name: 'transactionsSumRecieved',
    }, 
    {
      class: 'Double',
      name: 'transactionsSumSent',
    },
  ]
});