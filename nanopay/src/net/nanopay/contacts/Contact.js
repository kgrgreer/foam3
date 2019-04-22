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
        Keeps track of the different states a contact can be in with respect to
        whether the real user has signed up yet or not.
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
        A reference to the real user's business once they've signed up.
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'realUser',
      documentation: `A reference to the real user once they've signed up.`
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      value: false
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'bankAccount',
      documentation: `A reference to the contact bank account if created while registering the contact.`
    },
    {
      name: 'businessAddress',
      view: { class: 'net.nanopay.sme.ui.AddressView' }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'businessStatus',
      storageTransient: true
    },
    {
      name: 'emailVerified',
      value: true,
      documentation: `
        We do this so that the transaction validation logic doesn't throw an
        error when a contact is either the payer or payee of an invoice.
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
