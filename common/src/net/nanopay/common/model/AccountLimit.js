foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'AccountLimit',
  properties: [
    {
      class: 'Int',
      name:  'dailyLimit'
    },
    {
      class: 'Int',
      name:  'weeklyLimit'
    },
    {
      class: 'Int',
      name:  'monthlyLimit'
    },
    {
      class: 'Int',
      name:  'yearlyLimit'
    }
  ]
});
