foam.CLASS({
  package: 'net.nanopay.liquidity.ui.account',
  name: 'Balance',
  imports: [
    'data'
  ],
  properties: [
    {
      class: 'String',
      name: 'currency',
      visibility: 'RO',
      expression: function(data$denomination) {
        return data$denomination;
      }
    },
    {
      class: 'Long',
      name: 'balance',
      visibility: 'RO',
      expression: function(data$balance) {
        return data$balance;
      }
    }
  ],
  actions: [
    {
      name: 'addFunds',
      code: function() {
        alert('TODO');
      }
    }
  ]
});
