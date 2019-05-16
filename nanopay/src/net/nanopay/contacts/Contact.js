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
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.Iterator',
    'java.util.List',
    'java.util.regex.Pattern',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.AddressException',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.BankAccount',
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
    'signUpStatus',
    'deleted'
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
      validateObj: function(firstName) {
        if ( !! firstName ) {
          var containsDigitRegex = /\d/;
          if ( firstName.length > this.NAME_MAX_LENGTH ) {
            return 'First name cannot exceed 70 characters.';
          } else if ( containsDigitRegex.test(firstName) ) {
            return 'First name cannot contain numbers.';
          }
        }
      }
    },
    {
      name: 'middleName',
      validateObj: function(middleName) {}
    },
    {
      name: 'lastName',
      validateObj: function(lastName) {
        if ( !! lastName ) {
          var containsDigitRegex = /\d/;
          if ( lastName.length > this.NAME_MAX_LENGTH ) {
            return 'Last name cannot exceed 70 characters.';
          } else if ( containsDigitRegex.test(lastName) ) {
            return 'Last name cannot contain numbers.';
          }
        }
      }
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
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          Business business = (Business) localBusinessDAO.inX(x).find(getBusinessId());
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

          if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
            throw new IllegalStateException("Business name is required.");
          }

          if ( this.getBankAccount() != 0 ) {
            BankAccount bankAccount = (BankAccount) this.findBankAccount(x);
            
            if ( bankAccount == null ) throw new RuntimeException("Bank account not found.");

            if ( SafetyUtil.isEmpty(bankAccount.getName()) ) {
              throw new RuntimeException("Financial institution name required.");
            }

            Address businessAddress = this.getBusinessAddress();
            DAO countryDAO = (DAO) x.get("countryDAO");
            DAO regionDAO = (DAO) x.get("regionDAO");

            Country country = (Country) countryDAO.find(businessAddress.getCountryId());
            if ( country == null ) {
              throw new RuntimeException("Invalid country id.");
            }

            Region region = (Region) regionDAO.find(businessAddress.getRegionId());
            if ( region == null ) {
              throw new RuntimeException("Invalid region id.");
            }

            Pattern streetNumber = Pattern.compile("^[0-9]{1,16}$");
            if ( ! streetNumber.matcher(businessAddress.getStreetNumber()).matches() ) {
              throw new RuntimeException("Invalid street number.");
            }

            if ( SafetyUtil.isEmpty(businessAddress.getStreetName()) ) {
              throw new RuntimeException("Invalid street name.");
            } else if ( businessAddress.getStreetName().length() > 100 ) {
              throw new RuntimeException("Street name cannot exceed 100 characters");
            }
            else {
              businessAddress.setStreetName(businessAddress.getStreetName().trim());
            }

            if ( SafetyUtil.isEmpty(businessAddress.getCity()) ) {
              throw new RuntimeException("Invalid city name.");
            } else if ( businessAddress.getCity().length() > 100 ) {
              throw new RuntimeException("City cannot exceed 100 characters");
            } else {
              businessAddress.setCity(businessAddress.getCity().trim());
            }

            if ( ! this.validatePostalCode(businessAddress.getPostalCode(), businessAddress.getCountryId()) ) {
              String codeType = businessAddress.getCountryId().equals("US") ? "zip code" : "postal code";
              throw new RuntimeException("Invalid " + codeType + ".");
            }
          }
        }
        if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
          throw new IllegalStateException("Organization is required.");
        }
      `
    },
    {
      type: 'Boolean',
      name: 'validatePostalCode',
      args: [
        {
          class: 'String',
          name: 'code'
        },
        {
          class: 'String',
          name: 'countryId'
        }
      ],
      javaCode: `
        Pattern caPosCode = Pattern.compile("^[ABCEGHJ-NPRSTVXY]\\\\d[ABCEGHJ-NPRSTV-Z][ -]?\\\\d[ABCEGHJ-NPRSTV-Z]\\\\d$");
        Pattern usPosCode = Pattern.compile("^\\\\d{5}(?:[-\\\\s]\\\\d{4})?$");

        switch ( countryId ) {
          case "CA":
            return caPosCode.matcher(code).matches();
          case "US":
            return usPosCode.matcher(code).matches();
          default:
            return false;
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
