foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'Frequency',

  documentation: 'Frequency.',

  values: [
    {
      name: 'DAILY',
      label: 'Daily',
      ms: 24 * 60 * 60 * 1000
    },
    { name: 'WEEKLY',          label: 'Weekly' },
    { name: 'PER_TRANSACTION', label: 'Per Transaction' }
  ],

  properties: [
    {
      class: 'Long',
      name: 'ms'
    }
  ]
});
