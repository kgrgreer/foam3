foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLimit',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Pre-defined limit for transactions.',


  properties: [
    {
      class: 'Currency',
      name: 'limit',
      documentation: 'Amount that account balance should not exceed'
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      documentation: 'Transaction limit operation.'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.Frequency',
      name: 'period',
      documentation: 'Transaction limit time frame. (Day, Week etc.)'
    },
    {
      class: 'Date',
      name: 'expiry',
      documentation: 'Date when running balance should be reset.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      documentation: 'Spid to configure transaction limit.'
    }
  ]
});
