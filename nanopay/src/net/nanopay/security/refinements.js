foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Short',
      name: 'loginAttempts',
      value: 0
    },
    {
      documentation: 'Visibility in Global Directory / Parners lookup',
      name: 'isPublic',
      class: 'Boolean',
      value: true
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'List',
      name: 'signatures',
      documentation: 'List of signatures for a given transaction',
      javaType: 'java.util.ArrayList<net.nanopay.security.Signature>',
      includeInSignature: false,
    }
  ]
});
