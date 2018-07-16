foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'Digital Account. Default to monitary denomination.',

  properties: [
    {
      class: 'String',
      name: 'denomination',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD'
    },
    {
      class: 'Boolean',
      name: 'isDigitalAccount',
      value: true
    }
  ],

  methods: [
    {
      name: 'balance',
      code: function() {
        return 0;
      },
      javaReturns: 'Object',
      javaCode: `
        return 0L;
      `
    }
  ]
});
