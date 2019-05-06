foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'Contact',
  extends: 'foam.nanos.auth.User',

  documentation: `
    Contacts were introduced as a part of the Self-Serve project. They represent
    people who, although they are not on the platform, can still receive invoices from
    platform users.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.Iterator',
    'java.util.List',
    'java.util.regex.Pattern',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.AddressException',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.model.Business',
  ],

  constants: [
    {
      name: 'NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  tableColumns: [
    'organization',
    'legalName',
    'email',
    'signUpStatus'
  ],

  properties: [
    {
      name: 'organization',
      label: 'Company',
      validateObj: function(organization) {
        if (
          typeof organization !== 'string' ||
          organization.trim().length === 0
        ) {
          return 'Business name required';
        }
      },
      postSet: function(_,n) {
        this.businessName = n;
      }
    },
    {
      name: 'legalName',
      label: 'Name'
    },
    {
      name: 'email',
      label: 'Email',
      validateObj: function(email) {
        if ( ! this.businessId ) {
          var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if ( ! emailRegex.test(email) ) {
            return 'Invalid email address.';
          }
        }
      }
    },
    {
      name: 'firstName',
      validateObj: function(firstName) {}
    },
    {
      name: 'middleName',
      validateObj: function(middleName) {}
    },
    {
      name: 'lastName',
      validateObj: function(lastName) {}
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.contacts.ContactStatus',
      name: 'signUpStatus',
      label: 'Status',
      tableWidth: 170,
      documentation: `
      Tracks the registration status of a contact with respect to
      whether the user can sign in or not.
      `,
      tableCellFormatter: function(state, obj) {
        this.start()
          .start().addClass('contact-status-circle-' + (state.label).replace(/\s+/g, '')).end()
          .start().addClass('contact-status-' + (state.label).replace(/\s+/g, ''))
            .add(state.label)
          .end()
        .end();
      }
    },
    {
      // TODO: This should probably be defined by a relationship.
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      documentation: `
      A unique ID for the business associated with the human being, or real user, and 
      declared by the real user at registration. 
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'realUser',
      documentation: `A unique ID for the human being, or real user, who registers with 
      our platform.`
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether a human being, or real user, is able to login.',
      value: false
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'bankAccount',
      documentation: `A unique ID for the bank account of the contact if created while 
      registering the contact [Clarify: Registering a contact doesn't require a bank acount?].`
    },
    {
      name: 'businessAddress',
      documentation: 'An unstructured address field for the business.',
      view: { class: 'net.nanopay.sme.ui.AddressView' }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'businessStatus',
      documentation: 'Determines the status of a business.',
      storageTransient: true
    },
    {
      name: 'emailVerified',
      value: true,
      documentation: `
      Verifies an email address as valid.  If the email address is not verified the transaction 
      validation logic will throw an error when a contact is either the payer or payee of an invoice.
      `
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String containsDigitRegex = ".*\\\\d.*";

        if ( getBusinessId() != 0 ) {
          DAO businessDAO = (DAO) x.get("businessDAO");
          Business business = (Business) businessDAO.inX(x).find(getBusinessId());
          if ( business == null ) {
            throw new IllegalStateException("The business this contact references was not found.");
          }
        } else {
          boolean isValidEmail = true;
          try {
            InternetAddress emailAddr = new InternetAddress(this.getEmail());
            emailAddr.validate();
          } catch (AddressException ex) {
            isValidEmail = false;
          }

          if ( this.getFirstName().length() > NAME_MAX_LENGTH ) {
            throw new IllegalStateException("First name cannot exceed 70 characters.");
          } else if ( Pattern.matches(containsDigitRegex, this.getFirstName()) ) {
            throw new IllegalStateException("First name cannot contain numbers.");
          } else if ( this.getLastName().length() > NAME_MAX_LENGTH ) {
            throw new IllegalStateException("Last name cannot exceed 70 characters.");
          } else if ( Pattern.matches(containsDigitRegex, this.getLastName()) ) {
            throw new IllegalStateException("Last name cannot contain numbers.");
          } else  if ( this.getBusinessId() == 0 && SafetyUtil.isEmpty(this.getEmail()) ) {
            throw new IllegalStateException("Email is required.");
          } else if ( ! isValidEmail ) {
            throw new IllegalStateException("Invalid email address.");
          }
        }

        if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
          throw new IllegalStateException("Organization is required.");
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.create." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.read." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.update." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.delete." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    }
  ]
});
