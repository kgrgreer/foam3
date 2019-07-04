foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  javaImports: [
    'java.util.Date'
  ],

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
    },
    {
      class: 'DateTime',
      name: 'nextLoginAttemptAllowedAt',
      type: 'Date',
      javaFactory: 'return new Date();',
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'TransactionRefine',
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
