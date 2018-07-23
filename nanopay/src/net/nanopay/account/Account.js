foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',
  //abstract: true,

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
      documentation: 'Unit of measure of the balance - such as Currency. The value of the denomication is the currency code, for example.',
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      label: 'Set As Default',
      value: false
    },
    // TDODO: access/scope: public, private
    {
      class: 'String',
      name: 'type',
      transient: true,
      visibility: foam.u2.Visibility.RO,
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: `
        return getClass().getSimpleName();
`
    }
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
