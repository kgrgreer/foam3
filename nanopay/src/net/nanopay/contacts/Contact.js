/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  name: 'Contact',
  extends: 'net.nanopay.contacts.PersonalContact',

  documentation: `
    The base model, as part of the Self-Serve project, for business representatives who,
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
    'net.nanopay.model.Business'
  ],

  imports: [
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'countryDAO',
    'targetCorridorDAO',
    'publicBusinessDAO',
    'pushMenu',
    'subject',
    'stack',
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
    'net.nanopay.ui.wizard.WizardController'
  ],

  messages: [
    {
      name: 'CONFIRM_RELATIONSHIP',
      message: `I have a business relationship with this contact`
    },
    { name: 'ERROR_BUSINESS_PROFILE_NAME_MESSAGE', message: 'Business name required' },
    { name: 'CONFIRMATION_REQUIRED', message: 'Confirmation required' },
    { name: 'MISSING_BANK_WARNING', message: 'Missing bank information' },
    { name: 'CONTACT_PERMISSION', message: 'contact.rw.shouldinvite' },
  ],

  properties: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Property)
      .map(p => p.clone())),
      {
        // REVIEW: this should be storageTransient - believe it's just used for
        // capability input.
        class: 'Boolean',
        name: 'confirm',
        documentation: `True if the user confirms their relationship with the contact.`,
        includeInDigest: false,
        section: 'operationsInformation',
        gridColumns: 6,
        label: '',
        updateVisibility: function() {
          return foam.u2.DisplayMode.HIDDEN;
        },
        createVisibility: function(isEdit, isConsent) {
          return isEdit || ! isConsent ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
        },
        view: function(_, X) {
          return {
            class: 'foam.u2.CheckBox',
            label: X.data.CONFIRM_RELATIONSHIP
          };
        },
        validateObj: function(confirm, isConsent) {
          if ( ! confirm && isConsent) {
            return this.CONFIRMATION_REQUIRED;
          }
        }
      },
    {
      name: 'organization',
      label: 'Business',
      documentation: 'The organization/business associated with the Contact.',
      view: { class: 'foam.u2.TextField', focused: true },
      validateObj: function(organization) {
        if (
          typeof organization !== 'string' ||
          organization.trim().length === 0
        ) {
          return this.ERROR_BUSINESS_PROFILE_NAME_MESSAGE;
        }
      },
      postSet: function(_, n) {
        this.businessName = n;
      },
      tableCellFormatter: function(X, obj) {
        if ( ! obj.businessId ) {
          this.start().add(obj.organization).end();
        } else {
          obj.publicBusinessDAO
            .find(obj.businessId)
            .then(business =>
              this.start()
                .add(business ? business.toSummary() : obj.organization)
              .end()
          );
        }
      }
    },
    {
      class: 'String',
      name: 'operatingBusinessName',
      documentation: `The operating business name of the business the contact is
        associated to.
        This is the opt-in name the business wants to display on our platform (used for searching),
        as opposed to businessName / organization which is the company’s legal name.`,
      includeInDigest: false,
      visibility: 'HIDDEN'
    },
    {
      // TODO: This should probably be defined by a relationship.
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      javaValue: '0',
      name: 'businessId',
      documentation: `A unique identifier for the business associated with the Contact.`,
      includeInDigest: false,
      section: 'businessInformation',
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      documentation: 'The postal address of the business associated with the Contact.',
      includeInDigest: false,
      section: 'businessInformation',
      label: '',
      view: function(_, X) {
        // Removing auth checks. TODO: solution on what to show based on what.
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          showDisclaimer: false
        };
      },
      factory: function() {
        return  this.Address.create();
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'businessStatus',
      documentation: 'Tracks the status of a business.',
      section: 'systemInformation',
      gridColumns: 6,
      storageTransient: true
    },
    {
      // TODO/REVIEW: this should be transient.
      class: 'String',
      name: 'warning',
      section: 'systemInformation',
      label: '',
      includeInDigest: false,
      tableWidth: 80,
      expression: function(bankAccount, businessId) {
        return ! bankAccount && ! businessId ? this.MISSING_BANK_WARNING : '';
      },
      tableHeaderFormatter: function() { },
      tableCellFormatter: function(value, obj) {
        if ( value ) {
          this.start()
            .attrs({ title: value } )
            .start({ class: 'foam.u2.tag.Image', data: 'images/warning.svg' }).end()
          .end();
        }
      }
    }
  ],

  actions: [
    {
      name: 'addBankAccount',
      isAvailable: function() {
        return this.signUpStatus !== this.ContactStatus.READY && ! this.bankAccount;
      },
      code: function(X) {
        X.controllerView.add(this.WizardController.create({
          model: 'net.nanopay.contacts.Contact',
          wizardView: 'net.nanopay.contacts.ui.ContactWizardView',
          data: this,
          controllerMode: foam.u2.ControllerMode.CREATE,
          isEdit: true
        }, X));
      }
    },
    {
      name: 'edit',
      label: 'Edit Details',
      isAvailable: function() {
        return this.signUpStatus === this.ContactStatus.READY && this.businessId === 0;
      },
      code: function(X) {
        X.stack.push(this.WizardController.create({
          model: 'net.nanopay.contacts.Contact',
          wizardView: 'net.nanopay.contacts.ui.ContactWizardView',
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
          businessName: this.organization,
          createdBy: this.subject.user.id,
          isContact: true
        }, X);
        X.controllerView.add(this.WizardController.create({
          model: 'net.nanopay.model.Invitation',
          wizardView: 'net.nanopay.contacts.ui.InvitationWizardView',
          data: invite,
          controllerMode: foam.u2.ControllerMode.EDIT,
          isEdit: true
        }, X))
      }
    },
    {
      name: 'requestMoney',
      isEnabled: function() {
        return (
          this.businessId &&
          this.businessStatus !== this.AccountStatus.DISABLED
        ) || this.bankAccount;
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
        return (
          this.businessId &&
          this.businessStatus !== this.AccountStatus.DISABLED
        ) || this.bankAccount;
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
  ],

  methods: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Method)
      .map(p => p.clone())),
    async function init() {
      this.isConsent = await this.auth.check(this.CONTACT_PERMISSION);
    },
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
        super.validate(x);
        if ( getBusinessId() != 0 ) {
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          Business business = (Business) localBusinessDAO.inX(x).find(getBusinessId());
          if ( business == null ) {
            throw new IllegalStateException("The business this contact references was not found.");
          }
        } else {

          if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
            throw new IllegalStateException("Business name is required.");
          }

          if ( ! foam.util.SafetyUtil.isEmpty(this.getBankAccount()) ) {
            BankAccount bankAccount = (BankAccount) this.findBankAccount(x);

            if ( bankAccount == null ) throw new RuntimeException("Bank account not found.");

            if ( SafetyUtil.isEmpty(bankAccount.getName()) ) {
              throw new RuntimeException("Financial institution name required.");
            }

            Address businessAddress = this.getBusinessAddress();

            if ( businessAddress == null ) {
              throw new IllegalStateException("Business Address is required.");
            }

            java.util.List<foam.core.PropertyInfo> props = businessAddress.getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
            for ( foam.core.PropertyInfo prop : props ) {
              try {
                prop.validateObj(x, businessAddress);
              } catch ( IllegalStateException e ) {
                throw e;
              }
            }
          }
        }
        if ( SafetyUtil.isEmpty(this.getOrganization()) ) {
          throw new IllegalStateException("Organization is required.");
        }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        if ( this.operatingBusinessName ) return this.operatingBusinessName;
        if ( this.organization ) return this.organization;
        if ( this.legalName ) return this.legalName;
        if ( this.lastName && this.firstName ) return this.firstName + ' ' + this.lastName;
        if ( this.lastName ) return this.lastName;
        if ( this.firstName ) return this.firstName;
        return '';
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getOperatingBusinessName()) ) return this.getOperatingBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getOrganization()) ) return this.getOrganization();
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) && ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName() + " " + this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) ) return this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName();
        return "";
      `
    }
  ]
});
