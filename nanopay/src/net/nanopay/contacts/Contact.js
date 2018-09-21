foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'Contact',
  extends: 'foam.nanos.auth.User',

  documentation: `
    Contacts were introduced as a part of the Self-Serve project. They represent
    people that are not yet on the platform, but that you can still send
    invoices to.
  `,

  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'java.util.Iterator',
    'java.util.List',
    'java.util.regex.Pattern',
    'foam.util.SafetyUtil',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.AddressException'
  ],

  constants: [
    {
      name: 'ACCOUNT_NAME_MAX_LENGTH',
      type: 'int',
      value: 70
    }
  ],

  properties: [
    {
      name: 'enabled',
      documentation: `Contacts shouldn't be able to log in like normal users.`,
      value: false
    }
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

        boolean isValidEmail = true;
        try {
          InternetAddress emailAddr = new InternetAddress(this.getEmail());
          emailAddr.validate();
        } catch (AddressException ex) {
          isValidEmail = false;
        }

        if ( SafetyUtil.isEmpty(this.getFirstName()) ) {
          throw new IllegalStateException("First name is required.");
        } else if ( this.getFirstName().length() > ACCOUNT_NAME_MAX_LENGTH ) {
          throw new IllegalStateException("First name cannot exceed 70 characters.");
        } else if ( Pattern.matches(containsDigitRegex, this.getFirstName()) ) {
          throw new IllegalStateException("First name cannot contain numbers.");
        } else if ( SafetyUtil.isEmpty(this.getLastName()) ) {
          throw new IllegalStateException("Last name is required.");
        } else if ( this.getLastName().length() > ACCOUNT_NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Last name cannot exceed 70 characters.");
        } else if ( Pattern.matches(containsDigitRegex, this.getLastName()) ) {
          throw new IllegalStateException("Last name cannot contain numbers.");
        } else if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
          throw new IllegalStateException("Organization is required.");
        } else if ( SafetyUtil.isEmpty(this.getEmail()) ) {
          throw new IllegalStateException("Email is required.");
        } else if ( ! isValidEmail ) {
          throw new IllegalStateException("Invalid email address.");
        }
      `
    }
  ]
});
