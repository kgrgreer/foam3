foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'Base model of all Accounts',

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
    // type: CI, CO, ...
    // access: public, private
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
