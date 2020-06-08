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
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankPadAuthorization',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input bank account details.',

  requires: [
    'foam.nanos.auth.Address'
  ],

  axioms: [
    { class: 'net.nanopay.cico.ui.bankAccount.form.BankPADAuthorizationCSSAxiom' },
  ],

  messages: [
    { name: 'Step1', message: 'Step ' },
    { name: 'Step2', message: ' :Pre-authorized debit confirmation' },
    { name: 'LabelFirstName', message: 'First Name' },
    { name: 'LabelLastName', message: 'Last Name' },
    { name: 'LabelCountry', message: 'Country' },
    { name: 'LabelStreetNumber', message: 'Street Number' },
    { name: 'LabelStreetName', message: 'Street Name' },
    { name: 'LabelAddress2', message: 'Address 2 (optional)' },
    { name: 'Address2Hint', message: 'Apartment, suite, unit, building, floor, etc.' },
    { name: 'LabelCity', message: 'City' },
    { name: 'LabelRegion', message: 'Region' },
    { name: 'LabelPostal', message: 'Postal Code' },
    { name: 'LabelAccount', message: 'Account Number' },
    { name: 'LabelInstitute', message: 'Institution Number' },
    { name: 'LabelTransit', message: 'Transit Number' },
    { name: 'TC1', message: 'I authorize nanopay Corporation to withdraw from my (debit)account with the financial institution listed above from time to time for the amount that I specify when processing a one-time ("sporadic") pre-authorized debit.' },
    { name: 'TC2', message: 'I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD Agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit ' },
    { name: 'TC3', message: 'This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation or by visiting ' },
    { name: 'link', message: 'www.payments.ca.' },
    { name: 'Accept', message: 'I Agree' },
    { name: 'Back', message: 'Back' },
    { name: 'BANK_ADDRESS_TITLE', message: 'Bank Branch Address' }

  ],
  properties: [
    {
      class: 'String',
      name: 'firstName',
      factory: function() {
        return this.viewData.user.firstName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.firstName = newValue;
      }
    },
    {
      class: 'String',
      name: 'lastName',
      factory: function() {
        return this.viewData.user.lastName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.lastName = newValue;
      }
    },
    {
      class: 'String',
      name: 'streetNumber',
      factory: function() {
        return this.viewData.user.address.streetNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.streetNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'streetName',
      factory: function() {
        return this.viewData.user.address.streetName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.streetName = newValue;
      }
    },
    {
      class: 'String',
      name: 'suite',
      factory: function() {
        return this.viewData.user.address.suite;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.suite = newValue;
      }
    },
    {
      class: 'String',
      name: 'city',
      factory: function() {
        return this.viewData.user.address.city;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.city = newValue;
      }
    },
    {
      name: 'country',
      view: function(_, X) {
        var expr = foam.mlang.Expressions.create();

        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO
            .where(expr.
              EQ(foam.nanos.auth.Country.CODE, 'CA')
            ),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      },
      factory: function() {
        return this.viewData.user.address.countryId;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.countryId = newValue;
      }
    },
    {
      name: 'region',
      view: function(_, X) {
        var expr = foam.mlang.Expressions.create();

        return foam.u2.view.ChoiceView.create({
          dao: X.regionDAO
            .where(expr
              .EQ(foam.nanos.auth.Region.COUNTRY_ID, 'CA')
            ),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      },
      factory: function() {
        return this.viewData.user.address.regionId;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.regionId = newValue;
      }
    },
    {
      class: 'String',
      name: 'postalCode',
      factory: function() {
        return this.viewData.user.address.postalCode;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.postalCode = newValue;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'bankAddress',
      documentation: `Bank account address.`,
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' },
      postSet: function(oldValue, newValue) {
        this.viewData.bankAddress = newValue;
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.nextLabel = this.Accept;
      this.backLabel = this.Back;
      this.viewData.agree1 = this.TC1;
      this.viewData.agree2 = this.TC2;
      this.viewData.agree3 = this.TC3;
      this
        .addClass(this.myClass())
        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step1 + (this.wizard.position+1) + this.Step2).end()
        .end()
        .start().addClass('infoContainer-wizard')
          .start('p').add('Legal Name').addClass('headings').end()

          .start().addClass('inline')
            .start().add(this.LabelFirstName).addClass('infoLabel').end()
            .start(this.FIRST_NAME).addClass('inputLarge').end()
          .end()
          .start().addClass('inline').addClass('float-right')
            .start().add(this.LabelLastName).addClass('infoLabel').end()
            .start(this.LAST_NAME).addClass('inputLarge').end()
          .end()

          .start('p').add('Address').addClass('headings').end()

          .start().addClass('inline')
            .start().addClass('countryContainer')
              .start().add(this.LabelCountry).addClass('infoLabel').end()
              .tag(this.COUNTRY)
              .start().addClass('longcaret').end()
            .end()
          .end()

          .start().addClass('inline')
            .start().add(this.LabelStreetNumber).addClass('infoLabel').end()
            .start(this.STREET_NUMBER).addClass('inputLarge').end()
          .end()
          .start().addClass('inline').addClass('float-right')
            .start().add(this.LabelStreetName).addClass('infoLabel').end()
            .start(this.STREET_NAME).addClass('inputLarge').end()
          .end()

          .start().addClass('inline')
            .start().add(this.LabelAddress2).addClass('infoLabel').end()
            .start(this.SUITE).addClass('inputLarge').end()
            .start('p').add(this.Address2Hint).addClass('address2Hint').end()
          .end()
          .start().addClass('inline').addClass('float-right')
            .start().add(this.LabelCity).addClass('infoLabel').end()
            .start(this.CITY).addClass('inputLarge').end()
          .end()

          .start().addClass('inline')
            .start().addClass('regionContainer')
              .start().add(this.LabelRegion).addClass('infoLabel').end()
              .tag(this.REGION)
              .start().addClass('caret').end()
            .end()
          .end()
          .start().addClass('inline').addClass('float-right')
            .start().add(this.LabelPostal).addClass('infoLabel').end()
            .start(this.POSTAL_CODE).addClass('inputLarge').end()
          .end()

          .start('p').add('Banking Info').addClass('headings').end()
          .start('div').forEach( this.viewData.bankAccounts, function(account, index) {
            this
            .callIf( self.viewData.bankAccounts.length > 1, function() {
              this.start().add('Account ' + (index + 1)).addClass('header').end();
            })
            .start().addClass('inline')
              .start().add(self.LabelInstitute).addClass('infoLabel').end()
              .start().add(account.institutionNumber).addClass('notEditable').addClass('full-width-input-label').end()
            .end()
            .start().addClass('inline')
              .start().add(self.LabelTransit).addClass('infoLabel').end()
              .start().add(account.branchId).addClass('notEditable').addClass('inputLarge-label').end()
            .end()
            .start().addClass('inline').addClass('float-right')
              .start().add(self.LabelAccount).addClass('infoLabel').end()
              .start().add(account.accountNumber).addClass('notEditable').addClass('inputLarge-label').end()
            .end()
            .start().addClass('headings').add(self.BANK_ADDRESS_TITLE).end()
            .start().add(self.BANK_ADDRESS).end();
          }).end()

          .start('div').addClass('row').addClass('rowTopMarginOverride')
            .start('p')
              .add('Authorization').addClass('headings')
              .start('p').addClass('messageBody').add(this.TC1).end()
            .end()
            .start('p')
              .add('Recourse/Reimbursement').addClass('headings')
              .start('p').addClass('messageBody').add(this.TC2).start('a').addClass('messageBody').addClass('link').add(this.link).on('click', this.goToPayment).end().end()
            .end()
            .start('p')
              .add('Cancellation').addClass('headings')
              .start('p').addClass('messageBody').add(this.TC3).start('a').addClass('messageBody').addClass('link').add(this.link).on('click', this.goToPayment).end().end()
            .end()
          .end()
        .end();
    }
  ],
  listeners: [
    function goToPayment() {
      window.open('https://www.payments.ca', '_blank');
    },
 ]
});
