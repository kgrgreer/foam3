foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankPADForm',
  extends: 'foam.u2.Controller',

  documentation: 'Agreement form for PAD Authorization',

  import: [
    'countryDAO',
    'regionDAO',
    'user',
    'window'
  ],

  css: `
    ^section-header {
      font-size: 16px;
      font-weight: 900;
      margin-bottom: 16px;
    }
    ^section-header:first-child {
      margin-top: 0;
    }
    ^field-label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    ^input-size-half,
    ^input-size-half select {
      width: 218px;
      height: 40px;
    }
    ^input-size-full,
    ^input-size-full select {
      width: 100%;
      height: 40px;
    }
    ^input-hint {
      font-size: 10px;
      margin: 0;
      margin-top: 4px;
      color: #8e9090;
    }
    ^row-spacer {
      margin-bottom: 16px;
    }
    ^divider {
      width: 100%;
      height: 1px;
      background-color: #e2e2e3;
      margin: 24px 0;
    }
    ^account-label {
      margin-top: 16px;
      margin-bottom: 8px;
      font-weight: 800;
    }
    ^account-label:first-child {
      margin-top: 0;
    }
    ^disabled-input {
      border-radius: 3px;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      padding: 10px 8px;
      border: 1px solid #e2e2e3;
      box-sizing: border-box;
    }
    ^legal-header {
      font-size: 10px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    ^legal-header:first-child {
      margin-top: 0;
    }
    ^copy {
      color: #8e9090;
      font-size: 10px;
    }
  `,

  messages: [
    { name: 'LABEL_FIRST_NAME', message: 'First Name' },
    { name: 'LABEL_LAST_NAME', message: 'Last Name' },
    { name: 'LABEL_COUNTRY', message: 'Country' },
    { name: 'LABEL_STREET_NUMBER', message: 'Street Number' },
    { name: 'LABEL_STREET_NAME', message: 'Street Name' },
    { name: 'LABEL_ADDRESS_2', message: 'Address 2 (optional)' },
    { name: 'ADDRESS_2_HINT', message: 'Apartment, suite, unit, building, floor, etc.' },
    { name: 'LABEL_CITY', message: 'City' },
    { name: 'LABEL_REGION', message: 'Region' },
    { name: 'LABEL_POSTAL', message: 'Postal Code' },
    { name: 'LABEL_ACCOUNT', message: 'Account #' },
    { name: 'LABEL_INSTITUTION', message: 'Institution #' },
    { name: 'LABEL_TRANSIT', message: 'Transit #' },
    { name: 'TC1', message: 'I authorize nanopay Corporation to withdraw from my (debit)account with the financial institution listed above from time to time for the amount that I specify when processing a one-time ("sporadic") pre-authorized debit.' },
    { name: 'TC2', message: 'I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD Agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit ' },
    { name: 'TC3', message: 'This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation or by visiting ' },
    { name: 'LINK', message: 'www.payments.ca.' },
    { name: 'ACCEPT', message: 'I Agree' },
    { name: 'BACK', message: 'Back' }

  ],
  properties: [
    'viewData',
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
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.nextLabel = this.ACCEPT;
      this.backLabel = this.BACK;
      this.viewData.agree1 = this.TC1;
      this.viewData.agree2 = this.TC2;
      this.viewData.agree3 = this.TC3;

      this.addClass(this.myClass())
        .start('p').add('Legal Name').addClass(this.myClass('section-header')).end()

        .start().addClass('inline')
          .start().add(this.LABEL_FIRST_NAME).addClass(this.myClass('field-label')).end()
          .start(this.FIRST_NAME).addClass(this.myClass('input-size-half')).end()
        .end()
        .start().addClass('inline').addClass('float-right')
          .start().add(this.LABEL_LAST_NAME).addClass(this.myClass('field-label')).end()
          .start(this.LAST_NAME).addClass(this.myClass('input-size-half')).end()
        .end()

        .start().addClass(this.myClass('divider')).end()

        .start('p').add('Address').addClass(this.myClass('section-header')).end()

        .start().add(this.LABEL_COUNTRY).addClass(this.myClass('field-label')).end()
        .start(this.COUNTRY).addClass(this.myClass('input-size-full')).addClass(this.myClass('row-spacer')).end()

        .start().addClass('inline')
          .start().add(this.LABEL_STREET_NUMBER).addClass(this.myClass('field-label')).end()
          .start(this.STREET_NUMBER).addClass(this.myClass('input-size-half')).addClass(this.myClass('row-spacer')).end()
        .end()
        .start().addClass('inline').addClass('float-right')
          .start().add(this.LABEL_STREET_NAME).addClass(this.myClass('field-label')).end()
          .start(this.STREET_NAME).addClass(this.myClass('input-size-half')).addClass(this.myClass('row-spacer')).end()
        .end()

        .start().addClass('inline')
          .start().add(this.LABEL_ADDRESS_2).addClass(this.myClass('field-label')).end()
          .start(this.SUITE).addClass(this.myClass('input-size-half')).end()
          .start('p').add(this.ADDRESS_2_HINT).addClass(this.myClass('input-hint')).addClass(this.myClass('row-spacer')).end()
        .end()
        .start().addClass('inline').addClass('float-right')
          .start().add(this.LABEL_CITY).addClass(this.myClass('field-label')).end()
          .start(this.CITY).addClass(this.myClass('input-size-half')).addClass(this.myClass('row-spacer')).end()
        .end()

        .start().addClass('inline')
          .start().addClass('regionContainer')
            .start().add(this.LABEL_REGION).addClass(this.myClass('field-label')).end()
            .start(this.REGION).addClass(this.myClass('input-size-half')).end()
            .start().addClass('caret').end()
          .end()
        .end()
        .start().addClass('inline').addClass('float-right')
          .start().add(this.LABEL_POSTAL).addClass(this.myClass('field-label')).end()
          .start(this.POSTAL_CODE).addClass(this.myClass('input-size-half')).end()
        .end()

        .start().addClass(this.myClass('divider')).end()

        .start('p').add('Banking Info').addClass(this.myClass('section-header')).end()
        .start().forEach( this.viewData.bankAccounts, function(account, index) {
          this
            .callIf( self.viewData.bankAccounts.length > 1, function() {
              this.start().add('Account ' + (index + 1)).addClass(self.myClass('account-label')).end();
            })
            .start().add(self.LABEL_INSTITUTION).addClass(self.myClass('field-label')).end()
            .start().add(account.institutionNumber)
              .addClass(self.myClass('disabled-input'))
              .addClass(self.myClass('input-size-full'))
              .addClass(self.myClass('row-spacer'))
            .end()
            .start().addClass('inline')
              .start().add(self.LABEL_TRANSIT).addClass(self.myClass('field-label')).end()
              .start().add(account.branchId)
                .addClass(self.myClass('disabled-input'))
                .addClass(self.myClass('input-size-half'))
              .end()
            .end()
            .start().addClass('inline').addClass('float-right')
              .start().add(self.LABEL_ACCOUNT).addClass(self.myClass('field-label')).end()
              .start().add(account.accountNumber)
                .addClass(self.myClass('disabled-input'))
                .addClass(self.myClass('input-size-half'))
              .end()
            .end();
        }).end()

        .start().addClass(this.myClass('divider')).end()

        .start().addClass('row').addClass('rowTopMarginOverride')
          .start('p')
            .add('Authorization').addClass(this.myClass('legal-header'))
            .start('p').addClass(this.myClass('copy')).add(this.TC1).end()
          .end()
          .start('p')
            .add('Recourse/Reimbursement').addClass(this.myClass('legal-header'))
            .start('p').addClass(this.myClass('copy')).add(this.TC2).start('a').addClass('link').add(this.LINK).on('click', this.goToPayment).end().end()
          .end()
          .start('p')
            .add('Cancellation').addClass(this.myClass('legal-header'))
            .start('p').addClass(this.myClass('copy')).add(this.TC3).start('a').addClass('link').add(this.LINK).on('click', this.goToPayment).end().end()
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
