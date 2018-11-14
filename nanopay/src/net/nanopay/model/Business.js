foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Business',
  extends: 'foam.nanos.auth.User',

  documentation: 'Business extends user class & it is the company user for SME',

  properties: [
    {
      class: 'String',
      name: 'businessPermissionId',
      documentation: `
        A generated name that doesn't contain any special characters. Used in
        permission strings related to the business.
      `,
      expression: function(businessName, id) {
        return businessName.replace(/\W/g, '').toLowerCase() + id;
      },
      javaType: 'String',
      javaGetter: `
        return getBusinessName().replaceAll("\\\\W", "").toLowerCase() + getId();
      `
    }
  ],

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
