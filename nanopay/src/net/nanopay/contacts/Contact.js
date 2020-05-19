foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'Contact',
  extends: 'foam.nanos.auth.User',

  documentation: `
    The base model, as part of the Self-Serve project, for representing people who,
    although they are not registered on the platform, can still receive invoices from
    platform users. Used as a property model in ContactWizardView for the three steps
    of contact creation.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',

    'java.util.regex.Pattern',
    'javax.mail.internet.AddressException',
    'javax.mail.internet.InternetAddress',

    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business'
  ],

  imports: [
    'auth',
    'countryDAO',
    'user'
  ],

  requires: [
    'net.nanopay.fx.Corridor',
    'foam.nanos.auth.Country',
    'foam.dao.PromisedDAO',
    'foam.u2.DisplayMode'
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
    'status'
  ],

  sections: [
    {
      name: 'stepOne',
      title: 'Create a contact',
      subTitle: `
        Create a new contact by entering in their business information below.
        If you have their banking information, you can start sending payments
        to the contact right away.
      `
    },
    {
      name: 'stepTwo',
      title: 'Add banking information',
      subTitle: `
        Enter the contact’s bank account information. Please make sure that this is
        accurate as payments will go directly to the specified account.
      `
    },
    {
      name: 'stepThree',
      title: 'Add business address',
      subTitle: `
        In order to send payments to this business, we’ll need you to verify their
        business address below.
      `
    }
  ],

  messages: [
    {
      name: 'CONFIRM_RELATIONSHIP',
      message: `I confirm that I have a business relationship with this contact and
        acknowledge that the bank account info entered by the contact
        business will be used for all deposits to their account.`
    },
    {
      name: 'INVITE_LABEL',
      message: 'Invite this contact to join Ablii'
    },
    {
      name: 'RESTRICT_INVITE_LABEL',
      message: 'This contact cannot be invited to join Ablii'
    }
  ],

  properties: [
    {
      name: 'organization',
      documentation: 'The organization/business associated with the Contact.',
      section: 'stepOne',
      label: 'Business',
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. Vandelay Industries' },
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
      class: 'String',
      name: 'operatingBusinessName',
      documentation: `The operating business name of the business the contact is
        associated to.`,
      visibility: 'HIDDEN',
    },
    {
      name: 'legalName',
      documentation: `A field for the legal first and last name of the Contact,
        if different than the provided first name.  The field will default to first
        name, last name.`,
      visibility: 'HIDDEN',
      label: 'Name'
    },
    {
      name: 'email',
      documentation: 'The email address of the Contact.',
      section: 'stepOne',
      label: 'Email',
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. example@domain.com' },
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
      section: 'stepOne',
      gridColumns: 6,
      view: { class: 'foam.u2.tag.Input', placeholder: 'Optional' },
      validateObj: function(firstName) {
        if ( !! firstName ) {
          if ( firstName.length > this.NAME_MAX_LENGTH ) {
            return 'First name cannot exceed 70 characters.';
          }
        }
      }
    },
    {
      name: 'middleName',
      visibility: 'HIDDEN',
      validateObj: function(middleName) {}
    },
    {
      name: 'lastName',
      section: 'stepOne',
      gridColumns: 6,
      view: { class: 'foam.u2.tag.Input', placeholder: 'Optional' },
      validateObj: function(lastName) {
        if ( !! lastName ) {
          if ( lastName.length > this.NAME_MAX_LENGTH ) {
            return 'Last name cannot exceed 70 characters.';
          }
        }
      }
    },
    {
      class: 'Boolean',
      name: 'confirm',
      documentation: `True if the user confirms their relationship with the contact.`,
      section: 'stepOne',
      label: '',
      updateVisibility: function() {
        return foam.u2.DisplayMode.HIDDEN;
      },
      createVisibility: function(isEdit) {
        return isEdit ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.CheckBox',
          label: X.data.CONFIRM_RELATIONSHIP
        };
      },
      validateObj: function(confirm) {
        if ( ! confirm ) {
          return 'Confirmation required.';
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.contacts.ContactStatus',
      name: 'signUpStatus',
      documentation: `Tracks the registration status of a contact with respect to
        whether a individual person, or real user, can sign in or not.
      `,
      visibility: 'HIDDEN',
      label: 'Status',
      tableWidth: 170,
      tableCellFormatter: function(state, obj) {
        var format = obj.bankAccount && state != net.nanopay.contacts.ContactStatus.ACTIVE ? 'Ready' : 'Pending';
        var label = state == net.nanopay.contacts.ContactStatus.ACTIVE ? state.label.replace(/\s+/g, '') : format;
        this.start()
          .start().show(state != net.nanopay.contacts.ContactStatus.ACTIVE).addClass('contact-status-circle-' + label).end()
          .start('img')
            .show(state == net.nanopay.contacts.ContactStatus.ACTIVE)
            .attrs({ src: this.__subContext__.theme.logo })
            .style({ 'width': '15px', 'position': 'relative', 'top': '3px', 'right': '4px' })
            .end()
          .start().addClass('contact-status-' + label)
            .add(label)
          .end()
        .end();
      }
    },
    {
      // TODO: This should probably be defined by a relationship.
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      javaValue: '0',
      name: 'businessId',
      documentation: `A unique identifier for the business associated with the Contact.`,
      visibility: 'HIDDEN'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'realUser',
      documentation: `The ID for the individual person, or real user,
        who registers with our platform.`,
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the Contact can login to the platform.',
      visibility: 'HIDDEN',
      value: false
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'bankAccount',
      documentation: `The unique identifier for the bank account of the Contact
        if created while registering the Contact.`,
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'createBankAccount',
      documentation: 'A before put bank account object a user creates for the contact.',
      section: 'stepTwo',
      storageTransient: true,
      label: '',
      factory: function() {
        return net.nanopay.bank.BankAccount.create({}, this);
      },
      view: function(_, X) {
        let e = foam.mlang.Expressions.create();
        var pred = e.AND(
            e.EQ(foam.strategy.StrategyReference.DESIRED_MODEL_ID, 'net.nanopay.bank.BankAccount'),
            e.IN(foam.strategy.StrategyReference.STRATEGY, X.data.countries)
        );
        return foam.u2.view.FObjectView.create({
          data: X.data.createBankAccount,
          of: net.nanopay.bank.BankAccount,
          persistantData: { isDefault: true, forContact: true },
          enableStrategizer: X.data.bankAccount === 0,
          predicate: pred
        }, X);
      }
    },
    {
      name: 'availableCountries',
      section: 'stepOne',
      visibility: 'HIDDEN',
      expression: function(user) {
        return this.PromisedDAO.create({
          promise: user.corridors
            .select(this.MAP(this.Corridor.TARGET_COUNTRY))
            .then((sink) => {
              let unique = [...new Set(sink.delegate.array)];
              for ( i = 0; i < unique.length; i++ ) {
                unique[i] = foam.lookup(`net.nanopay.bank.${ unique[i] }BankAccount`);
              }
              this.countries = unique;
            })
        });
      }
    },
    {
      name: 'countries',
      visibility: 'HIDDEN',
      documentation: 'Stores available countries contact can have account domicilied in.'
    },
    {
      class: 'Boolean',
      name: 'shouldInvite',
      documentation: 'True if the user wants to invite the contact to join Ablii.',
      section: 'stepTwo',
      label: '',
      createVisibility: function(createBankAccount$country, isEdit) {
        return (createBankAccount$country != 'IN' && ! isEdit) ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function() {
        return foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        return foam.u2.CheckBox.create({ label: X.data.INVITE_LABEL });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      documentation: 'The postal address of the business associated with the Contact.',
      section: 'stepThree',
      label: '',
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          showDisclaimer: true,
          customCountryDAO: X.data.PromisedDAO.create({
            promise: X.data.auth.check(null, 'currency.read.USD').then((hasPermission) => {
              var q;
              if ( hasPermission && X.data.user.countryOfBusinessRegistration == 'CA' ) {
                q = X.data.OR(
                  X.data.EQ(X.data.Country.ID, 'CA'),
                  X.data.EQ(X.data.Country.ID, 'US'),
                  X.data.EQ(X.data.Country.ID, 'IN')
                );
              } else if ( hasPermission ) {
                q = X.data.OR(
                  X.data.EQ(X.data.Country.ID, 'CA'),
                  X.data.EQ(X.data.Country.ID, 'US')
                );
              } else {
                return X.data.auth.check(null, 'currency.read.INR').then((inrPermission) => {
                  if ( inrPermission ) {
                    q = X.data.OR(
                      X.data.EQ(X.data.Country.ID, 'CA'),
                      X.data.EQ(X.data.Country.ID, 'IN')
                    );
                  } else {
                    q = X.data.EQ(X.data.Country.ID, 'CA');
                  }
                  return X.data.countryDAO.where(q);
                });
              }
              return X.data.countryDAO.where(q);
            })
          })
        };
      },
      factory: function() {
        return this.Address.create();
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'businessStatus',
      documentation: 'Tracks the status of a business.',
      visibility: 'HIDDEN',
      storageTransient: true
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: 'True if the contact is being edited',
      visibility: 'HIDDEN',
      storageTransient: true,
      value: false
    },
    {
      name: 'emailVerified',
      value: true,
      documentation: `Verifies that the email address of the Contact is valid.
        If the email address is not verified the transaction validation logic will
        throw an error when a Contact is either the Payer or Payee of an invoice.
      `,
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'businessPhone',
      documentation: 'The phone number of the business.',
      visibility: 'HIDDEN',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      class: 'PhoneNumber',
      name: 'businessPhoneNumber',
      documentation: 'The phone number of the business.',
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'businessPhoneNumberVerified',
      writePermissionRequired: true,
      visibility: 'HIDDEN'
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
          } else if ( this.getLastName().length() > NAME_MAX_LENGTH ) {
            throw new IllegalStateException("Last name cannot exceed 70 characters.");
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

            if ( businessAddress == null ) {
              throw new IllegalStateException("Business Address is required.");
            }

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
        Pattern inPosCode = Pattern.compile("^\\\\d{6}(?:[-\\\\s]\\\\d{4})?$");

        switch ( countryId ) {
          case "CA":
            return caPosCode.matcher(code).matches();
          case "US":
            return usPosCode.matcher(code).matches();
          case "IN":
            return inPosCode.matcher(code).matches();
          default:
            return false;
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
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
        User user = ((Subject) x.get("subject")).getUser();
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
        User user = ((Subject) x.get("subject")).getUser();
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
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if (
          user.getId() != this.getOwner() &&
          ! auth.check(x, "contact.delete." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        if ( this.operatingBusinessName ) return this.operatingBusinessName;
        if ( this.organization ) return this.organization;
        if ( this.businessName ) return this.businessName;
        if ( this.legalName ) return this.legalName;
        if ( this.lastName && this.firstName ) return this.firstName + ' ' + this.lastName;
        if ( this.lastName ) return this.lastName;
        if ( this.firstName ) return this.firstName;
        return '';
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getOperatingBusinessName()) ) return this.getOperatingBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getOrganization()) ) return this.getOrganization();
        if ( ! SafetyUtil.isEmpty(this.getBusinessName()) ) return this.getBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) && ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName() + " " + this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) ) return this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName();
        return "";
      `
    }
  ]
});
