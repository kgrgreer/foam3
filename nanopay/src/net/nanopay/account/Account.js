foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',
  abstract: true,

  documentation: 'Base model of all Accounts',

  // relationships: owner (User)
  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'desc',
      label: 'Description'
    },
    {
      class: 'Boolean',
      name: 'transferIn',
      value: true
    },
    {
      class: 'Boolean',
      name: 'transferOut',
      value: true
    },
    {
      class: 'FObjectProperty',
      name: 'unitOfBalance'
    }
    // TDODO: access: public, private
  ],

  methods: [
    {
      name: 'balance',
      code: function() {
        return null;
      },
      javaReturns: 'Object',
      javaCode: `
        return null;
      `
    }
  ]
});
