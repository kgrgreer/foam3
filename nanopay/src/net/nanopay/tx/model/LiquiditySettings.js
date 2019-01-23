foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'LiquiditySettings',

  ids: ['account'],

  plural: 'Liquidity Settings',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.DigitalAccount',
      targetDAOKey: 'accountDAO',
      name: 'account',
      view: {
        class: 'foam.u2.view.ReferenceView',
        objToChoice: function(o) { return [ o.id, o.id + " " + o.name ]; }
      },
      documentation: 'Primary key and reference to account that liquidity settings are executed on. Can be instanceof DigitalAccount only.'
    },
    {
      class: 'Boolean',
      name: 'enableCashIn',
      documentation: 'Determines automatic cash in processing on accounts.'
    },
    {
      class: 'Currency',
      name: 'minimumBalance',
      documentation: 'Determines minimum balance' +
         ' required for automatic cash in.'
    },
    {
      class: 'Boolean',
      name: 'enableCashOut',
      documentation: 'Determines automatic cash out processing on accounts.'
    },
    {
      class: 'Currency',
      name: 'maximumBalance',
      documentation: 'Determines maximum balance' +
          ' required for automatic cash out.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.model.Frequency',
      name: 'cashOutFrequency',
      documentation: 'Determines how often a automatic cash out can occur.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'bankAccountId', // TODO: rename to account
      documentation: 'Account associated to setting.',
      view: {
        class: 'foam.u2.view.ReferenceView',
        objToChoice: function(o) { return [ o.id, o.id + " " + o.name ]; }
      },
    }
  ]
});
