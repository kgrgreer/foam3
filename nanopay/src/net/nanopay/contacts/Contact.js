foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'Contact',

  documentation: `
    Contacts were introduced as a part of the Self-Serve project. They represent
    people that are not yet on the platform, but that you can still send
    invoices to.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.HumanNameTrait'
  ],

  requires: [
    'foam.nanos.auth.Phone',
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

  // TODO: The following properties don't have to be defined here anymore once
  // https://github.com/foam-framework/foam2/issues/1529 is fixed:
  //   1. firstName
  //   2. middleName
  //   3. lastName
  //   4. legalName
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      name: 'userId',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      documentation: `The User instance that the contact refers to.`
    },
    {
      class: 'String',
      name: 'organization',
      documentation: 'Organization or business the contact is a part of.',
      required: true
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email Address',
      documentation: 'Email address of contact.',
      required: true,
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
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      documentation: `
        A phone object that include the phone number and whether it has been
        verified or not.
      `,
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      transient: true,
      documentation: 'The phone number of the contact.',
      expression: function(phone) {
        return phone.number;
      }
    },
    'firstName',
    'middleName',
    'lastName',
    'legalName'
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
