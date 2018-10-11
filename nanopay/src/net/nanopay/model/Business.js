foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Business',
  extends: 'foam.nanos.auth.User',

  documentation: 'Business extends user class & it is the company user for SME',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  implements: [
    'foam.core.Validatable'
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        if ( SafetyUtil.isEmpty(this.getBusinessName()) ) {
          throw new IllegalStateException("Business name cannot be empty.");
        }
      `
    }
  ]
});
