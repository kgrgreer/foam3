foam.CLASS({
  package: 'net.nanopay.integration.xero.model',
  name: 'XeroContact',
  extends: 'net.nanopay.contacts.Contact',
  javaImports:[
    'foam.util.SafetyUtil',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email Address',
      documentation: 'Email address of contact.',
      preSet: function(_, val) {
        return val.toLowerCase();
      },
      javaSetter:
      `email_ = val.toLowerCase();
       emailIsSet_ = true;`,
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ( ! emailRegex.test(email) ) {
          return 'Invalid email address.';
        }
      }
    },
  ],
  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String containsDigitRegex = ".*\\\\d.*";
        if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
          throw new IllegalStateException("Organization is required.");
        }
      `
    }
  ]
})