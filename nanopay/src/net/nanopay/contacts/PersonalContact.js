/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'PersonalContact',
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
    'foam.nanos.auth.Authorizable',
    'foam.nanos.crunch.lite.Capable',
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
    'javax.mail.internet.AddressException',
    'javax.mail.internet.InternetAddress',
    'net.nanopay.bank.BankAccount',
  ],

  imports: [
    'accountDAO',
    'auth',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'countryDAO',
    'targetCorridorDAO',
    'pushMenu',
    'subject',
    'user'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Country',
    'foam.u2.dialog.Popup',
    'foam.u2.DisplayMode',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.payment.PaymentProviderCorridor',
    'net.nanopay.ui.wizard.ContactWizardDetailView'
  ],

  constants: [
    {
      name: 'NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  tableColumns: [
    'status'
  ],

  sections: [
    {
      name: 'userInformation',
      title: 'Contact Information',
      order: 1
    },
    {
      name: 'businessInformation',
      order: 2
    }
  ],

  messages: [
    {
      name: 'INVITE_LABEL',
      message: 'Invite this contact to join '
    },
    {
      name: 'RESTRICT_INVITE_LABEL',
      message: 'This contact cannot be invited to join Ablii'
    },
    {
      name: 'UNABLE_TO_ADD_BANK_ACCOUNT_SPLITTER',
      message: 'capability store'
    },
    {
      name: 'UNABLE_TO_ADD_BANK_ACCOUNT',
      message: `You currently have not completed the necessary requirements
          to add an account to your contact. Please visit the capability store to enable payments.`
    },
    { name: 'INVALID_EMAIL', message: 'Valid email required' },
    { name: 'INVALID_FIRST_NAME', message: 'First name cannot exceed 70 characters' },
    { name: 'INVALID_LAST_NAME', message: 'Last name cannot exceed 70 characters' },
    { name: 'PLACEHOLDER', message: 'Please select....' },
    { name: 'HEADER', message: 'Country of bank account' },
  ],

  css: `
    .spinner {
      text-align: center;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .spinner img {
      width: 60px;
    }
  `,

  properties: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Property)
      .map(p => p.clone())),
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
      label: 'Email',
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ( ! emailRegex.test(email) ) {
          return this.INVALID_EMAIL;
        }
      }
    },
    {
      name: 'firstName',
      validateObj: function(firstName) {
        if ( !! firstName ) {
          if ( firstName.length > this.NAME_MAX_LENGTH ) {
            return this.INVALID_FIRST_NAME;
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
      validateObj: function(lastName) {
        if ( !! lastName ) {
          if ( lastName.length > this.NAME_MAX_LENGTH ) {
            return this.INVALID_LAST_NAME;
          }
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.contacts.ContactStatus',
      name: 'signUpStatus',
      documentation: `Tracks the registration status of a contact with respect to
        whether a individual person, or real user, can sign in or not.
        Pending, Ready and Connected
      `,
      includeInDigest: true,
      visibility: 'HIDDEN',
      label: 'Status',
      tableWidth: 100,
      tableCellFormatter: function(state, obj) {
        this.__subContext__.contactDAO.find(obj.id).then(contactObj => {
          this.start()
            .start('img')
              .show(state === net.nanopay.contacts.ContactStatus.CONNECTED)
              .attrs({ src: this.__subContext__.theme.logo })
              .style({ 'width': '15px', 'position': 'relative', 'top': '3px', 'right': '4px' })
            .end()
            .start().style({ color: state.color })
              .add(state.label)
            .end()
          .end();
        });
      }
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the Contact can login to the platform.',
      value: false
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'bankAccount',
      includeInDigest: true,
      documentation: `The unique identifier for the bank account of the Contact
        if created while registering the Contact.`,
      section: 'accountInformation',
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'createBankAccount',
      documentation: 'A before put bank account object a user creates for the contact.',
      storageTransient: true,
      label: '',
      visibility: function(countries) {
        return countries.length == 0 && ! this.createBankAccount ?
          foam.u2.DisplayMode.HIDDEN :
          foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        let e = foam.mlang.Expressions.create();
        var pred = e.AND(
            e.EQ(foam.strategy.StrategyReference.DESIRED_MODEL_ID, 'net.nanopay.bank.BankAccount'),
            e.IN(foam.strategy.StrategyReference.STRATEGY, X.data.countries)
        );
        var v = foam.u2.view.FObjectView.create({
          of: net.nanopay.bank.BankAccount,
          predicate: pred,
          placeholder: X.data.PLACEHOLDER,
          header: X.data.HEADER,
          classIsFinal: !! X.data.bankAccount,
          config: {
            id: { updateVisibility: 'HIDDEN' },
            summary: { updateVisibility: 'HIDDEN' }
          },
          skipBaseClass: true,
          copyOldData: function(o) { return { isDefault: o.isDefault, forContact: o.forContact }; }
        }, X);
        v.data$.sub(function() { v.data.forContact = true; v.data.clientAccountInformationTitle = ''; });

        return v;
      }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'availableCountries',
      visibility: 'HIDDEN',
      expression: function(targetCorridorDAO) {
        return this.PromisedDAO.create({
          promise: targetCorridorDAO.where(this.INSTANCE_OF(this.PaymentProviderCorridor))
            .select(this.MAP(this.PaymentProviderCorridor.TARGET_COUNTRY))
            .then(sink => {
              let unique = [...new Set(sink.delegate.array)];
              let arr = [];
              for ( i = 0; i < unique.length; i++ ) {
                model = foam.lookup(`net.nanopay.bank.${ unique[i] }BankAccount`);
                if ( model ) arr.push(model);
              }
              this.countries = arr;
            })
        });
      }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'countries',
      visibility: 'HIDDEN',
      documentation: `Stores available countries contact can have account domicilied in.`,
      factory: function() { return []; }
    },
    {
      transient: true,
      flags: ['web'],
      label: 'Action Required',
      name: 'noCorridorsAvailable',
      documentation: 'GUI when no corridor capabilities have been added to user.',
      visibility: function(countries, createBankAccount) {
        return countries.length == 0 && ! createBankAccount ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        var arr = X.data.UNABLE_TO_ADD_BANK_ACCOUNT.split(X.data.UNABLE_TO_ADD_BANK_ACCOUNT_SPLITTER);
        return X.E()
          .start()
            .add(arr[0])
            .start('span')
              .style({ 'color': '/*%PRIMARY3%*/ #604aff', 'cursor': 'pointer', 'text-decoration': 'underline'})
              .add(X.data.UNABLE_TO_ADD_BANK_ACCOUNT_SPLITTER)
              .on('click', function() {
                this.pushMenu('sme.main.appStore');
              }.bind(X))
            .end()
            .add(arr[1])
          .end()
      }
    },
    {
      transient: true,
      flags: ['web'],
      class: 'Boolean',
      name: 'shouldInvite',
      documentation: 'True if the user wants to invite the contact to join Ablii.',
      section: 'userInformation',
      label: '',
      readPermissionRequired: true,
      createVisibility: function(createBankAccount$country, isEdit) {
        return (createBankAccount$country != 'IN' && ! isEdit) ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function() {
        return foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        return foam.u2.CheckBox.create({ label: X.data.INVITE_LABEL + X.theme.appName });
      }
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
      section: 'systemInformation'
    },
    {
      class: 'Boolean',
      name: 'isConsent',
      documentation: 'Check if should shows consent checkbox when adding contact',
      visibility: 'HIDDEN',
      value: true
    }
  ],

  actions: [
    {
      name: 'addBankAccount',
      isAvailable: function() {
        return this.signUpStatus !== this.ContactStatus.READY && ! this.bankAccount;
      },
      code: function(X) {
        X.controllerView.add(this.ContactWizardDetailView.create({
          model: 'net.nanopay.contacts.Contact',
          data: this,
          controllerMode: foam.u2.ControllerMode.CREATE,
          isEdit: true
        }, X));
      }
    },
    {
      name: 'edit',
      label: 'Edit Details',
      code: function(X) {
        X.controllerView.add(this.ContactWizardDetailView.create({
          model: 'net.nanopay.contacts.Contact',
          data: this,
          controllerMode: foam.u2.ControllerMode.EDIT,
          isEdit: true
        }, X));
      }
    },
    {
      name: 'invite',
      isEnabled: function() {
        return this.signUpStatus != this.ContactStatus.READY;
      },
      isAvailable: async function() {
        let account = await this.accountDAO.find(this.bankAccount);
        let permission = await this.auth.check(null, 'menu.read.submenu.contact.invitation');
        return this.signUpStatus != this.ContactStatus.READY && ! this.INBankAccount.isInstance(account) && permission;
      },
      code: function(X) {
        var invite = net.nanopay.model.Invitation.create({
          email: this.email,
          createdBy: this.subject.user.id,
          isContact: true
        }, X);
        X.controllerView.add(this.ContactWizardDetailView.create({
          model: 'net.nanopay.model.Invitation',
          data: invite,
          controllerMode: foam.u2.ControllerMode.EDIT
        }, X))
      }
    },
    {
      name: 'requestMoney',
      isEnabled: function() {
        return !! this.bankAccount;
      },
      isAvailable: async function() {
        let permission = await this.auth.check(null, 'menu.read.mainmenu.invoices.receivables');
        return permission;
      },
      code: function(X) {
        this.checkAndNotifyAbilityToReceive().then((result) => {
          if ( result ) {
            X.menuDAO.find('sme.quickAction.request').then((menu) => {
              var clone = menu.clone();
              Object.assign(clone.handler.view, {
                invoice: this.Invoice.create({ contactId: this.id }),
                isPayable: false
              });
              clone.launch(X, X.controllerView);
            });
          }
        });
      }
    },
    {
      name: 'sendMoney',
      isEnabled: function() {
        return !! this.bankAccount;
      },
      isAvailable: async function() {
        let permission = await this.auth.check(null, 'menu.read.mainmenu.invoices.payables');
        return permission;
      },
      code: function(X) {
        this.checkAndNotifyAbilityToPay().then((result) => {
          if ( result ) {
            X.menuDAO.find('sme.quickAction.send').then((menu) => {
              var clone = menu.clone();
              Object.assign(clone.handler.view, {
                invoice: this.Invoice.create({ contactId: this.id }),
                isPayable: true
              });
              clone.launch(X, X.controllerView);
            });
          }
        });
      }
    },
    {
      name: 'delete',
      code: function(X) {
        X.controllerView.add(this.Popup.create(null, X).tag({
          class: 'net.nanopay.contacts.ui.modal.DeleteContactView',
          data: this
        }));
      }
    },
    {
      name: 'resetLoginAttempts',
      isAvailable: () => false,
      code: function(X) {
        return;
      }
    },
    {
      name: 'disableTwoFactor',
      isAvailable: () => false,
      code: function(X) {
        return;
      }
    }
  ],

  methods: [
    ...(foam.nanos.crunch.lite.CapableObjectData
    .getOwnAxiomsByClass(foam.core.Method)
    .map(p => p.clone())),
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
          ! auth.check(x, "contact.remove." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'validate',
      javaCode: `
        if ( this.getFirstName().length() > NAME_MAX_LENGTH ) {
          throw new IllegalStateException("First name cannot exceed 70 characters.");
        }
        if ( this.getLastName().length() > NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Last name cannot exceed 70 characters.");
        }

        // NOTE: Cannot use FObject.super.validate(x) because the super class
        // i.e, User class also overrides the method.
        var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( var prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});
