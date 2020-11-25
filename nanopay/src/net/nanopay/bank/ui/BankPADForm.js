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
  package: 'net.nanopay.bank.ui',
  name: 'BankPADForm',
  extends: 'foam.u2.Controller',

  documentation: 'Agreement form for PAD Authorization',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'auth',
    'countryDAO',
    'userDAO',
    'user'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Country'
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
    ^ .foam-u2-TextField {
      width: 100%;
    }
    ^ .net-nanopay-sme-ui-AddressView .two-column{
      margin-bottom: 15px;
    }
  `,

  messages: [
    { name: 'LABEL_LEGAL_NAME', message: 'Legal Name' },
    { name: 'LABEL_BUSINESS_NAME', message: 'Business Name' },
    { name: 'LABEL_FIRST_NAME', message: 'First Name' },
    { name: 'LABEL_LAST_NAME', message: 'Last Name' },
    { name: 'COMPANY_NAME_LABEL', message: 'Company Name' },
    { name: 'LABEL_ACCOUNT', message: 'Account #' },
    { name: 'LABEL_INSTITUTION', message: 'Institution #' },
    { name: 'LABEL_TRANSIT', message: 'Transit #' },
    { name: 'LABEL_ROUTING', message: 'Routing #' },
    { name: 'TC1', message: 'I authorize nanopay Corporation (for Canadian domestic transactions) or AFEX (for international transactions) to withdraw from my (debit) account with the financial institution listed above from time to time for the amount that I specify when processing a one-time ("sporadic") pre-authorized debit. I have agreed that we may reduce the standard period of pre-notification for variable amount PADs (Ablii Monthly Fee Invoice). We will send you notice of the amount of each Monthly Fee Invoice PAD five days before the PAD is due.' },
    { name: 'TC2', message: 'I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit ' },
    { name: 'TC3', message: 'This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation (for Canadian domestic transactions) or AFEX (for international transactions) or by visiting ' },
    { name: 'LINK', message: 'www.payments.ca' },
    { name: 'ACCEPT', message: 'I Agree' },
    { name: 'BACK', message: 'Back' },
    { name: 'LEGAL_AUTH', message: 'Authorization' },
    { name: 'LEGAL_RECOURSE', message: 'Recourse/Reimbursement' },
    { name: 'LEGAL_CANCEL', message: 'Cancellation' },
    { name: 'US_TC_1', message: `I/We authorize Associated Foreign Exchange Inc (AFEX) and the financial institution designated (or any other financial institution I/we may authorize at any time) to deduct regular and/or one-time payments as per my/our instructions for payment of all charges arising under my/our AFEX account(s) In accordance with this Authorization and the applicable rules of the National Automated Clearing House Association(ACH). AFEX will provide notice for each amount debited.` },
    { name: 'US_TC_2', message: 'This authority is to remain in effect until AFEX has received written notification from me/us of its change or termination. The notification must be received at least 10 business days before the next debit Is scheduled at the address provided below. AFEX shall advise me/us of any dishonored fees, and I/we agree to pay them.' }
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
      class: 'Boolean',
      name: 'isUSPAD',
      value: false
    },
    {
      class: 'String',
      name: 'companyName',
      factory: function() {
        if ( this.viewData.user.organization ) {
          return this.viewData.user.organization
        } else if ( this.viewData.user.businessName ) {
          return this.viewData.user.businessName;
        }
        return this.viewData.padCompanyName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.padCompanyName = newValue;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'companyNameDisabled',
      factory: function() {
        return this.viewData.user.businessName || this.viewData.user.organization ?
          foam.u2.DisplayMode.DISABLED :
          foam.u2.DisplayMode.RW;
      }
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();
      var self = this;
      this.nextLabel = this.ACCEPT;
      this.backLabel = this.BACK;

      if ( this.isUSPAD ) {
        this.viewData.agree1 = this.US_TC_1;
        this.viewData.agree2 = this.US_TC_2;
      } else {
        this.viewData.agree1 = this.TC1;
        this.viewData.agree2 = this.TC2;
        this.viewData.agree3 = this.TC3;
      }
      this.viewData.user.address = this.user.address;
      let updatedUser = await this.userDAO.find(this.user.id);
      this.addClass(this.myClass())
        .start('p').add(this.LABEL_LEGAL_NAME).addClass(this.myClass('section-header')).end()

        .start().addClass('inline')
          .start().add(this.LABEL_FIRST_NAME).addClass(this.myClass('field-label')).end()
          .start().add(this.FIRST_NAME).addClass(this.myClass('input-size-half')).end()
        .end()
        .start().addClass('inline').addClass('float-right')
          .start().add(this.LABEL_LAST_NAME).addClass(this.myClass('field-label')).end()
          .start().add(this.LAST_NAME).addClass(this.myClass('input-size-half')).end()
        .end()

        .start().addClass(this.myClass('divider')).end()

        .start('p').add(this.LABEL_BUSINESS_NAME).addClass(this.myClass('section-header')).end()

        .start().add(this.COMPANY_NAME_LABEL).addClass(this.myClass('field-label')).end()
        .start(this.COMPANY_NAME, { mode: this.companyNameDisabled }).addClass(this.myClass('input-size-full')).addClass(this.myClass('row-spacer')).end()

        .start().addClass(this.myClass('divider')).end()

        .start('p').add('Business Address').addClass(this.myClass('section-header')).end()

        .startContext({
          controllerMode: ! this.viewData.user.address.errors_ ?
          foam.u2.ControllerMode.VIEW :
          foam.u2.ControllerMode.EDIT
        })
          .tag({
            class: 'net.nanopay.sme.ui.AddressView',
            data: this.viewData.user.address,
            // Temporarily only allow businesses based in Canada for new users.
            customCountryDAO: updatedUser.address.countryId === 'CA' ? this.countryDAO.where(this.EQ(this.Country.ID, 'CA')) : this.countryDAO.where(this.EQ(this.Country.ID, 'US'))
          })
        .endContext()

        .start().addClass(this.myClass('divider')).end()

        .start('p').add('Banking Info').addClass(this.myClass('section-header')).end()
        .start().forEach( this.viewData.bankAccounts, function(account, index) {
          this
            .callIf( self.viewData.bankAccounts.length > 1, function() {
              this.start().add('Account ' + (index + 1)).addClass(self.myClass('account-label')).end();
            })
            .callIf(! self.isUSPAD, function() {
              this.start().add(self.LABEL_INSTITUTION).addClass(self.myClass('field-label')).end()
              .start().add(account.institutionNumber)
                .addClass(self.myClass('disabled-input'))
                .addClass(self.myClass('input-size-full'))
                .addClass(self.myClass('row-spacer'))
              .end();
            })
            .start().addClass('inline')
              .callIf( self.isUSPAD, function() {
                this.start().add(self.LABEL_ROUTING).addClass(self.myClass('field-label')).end();
              })
              .callIf( ! self.isUSPAD, function() {
                this.start().add(self.LABEL_TRANSIT).addClass(self.myClass('field-label')).end();
              })
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
          .callIf(this.isUSPAD, () => {
            this.start('p')
              .add(this.LEGAL_AUTH).addClass(this.myClass('legal-header'))
              .start('p').addClass(this.myClass('copy')).add(this.US_TC_1).end()
            .end()
            .start('p')
              .add(this.LEGAL_CANCEL).addClass(this.myClass('legal-header'))
              .start('p').addClass(this.myClass('copy')).add(this.US_TC_2).end()
            .end();
          })
          .callIf(! this.isUSPAD, () => {
            this.start('p')
              .add(this.LEGAL_AUTH).addClass(this.myClass('legal-header'))
              .start('p').addClass(this.myClass('copy')).add(this.TC1).end()
            .end()
            .start('p')
              .addClass(this.myClass('legal-header'))
              .add(this.LEGAL_RECOURSE)
              .start('p')
                .addClass(this.myClass('copy'))
                .add(this.TC2)
                .start('a').addClass('link')
                  .add(this.LINK)
                  .on('click', this.goToPayment)
                .end()
                .add('.')
              .end()
            .end()
            .start('p')
              .addClass(this.myClass('legal-header'))
              .add(this.LEGAL_CANCEL)
              .start('p')
                .addClass(this.myClass('copy'))
                .add(this.TC3)
                .start('a').addClass('link')
                  .add(this.LINK)
                  .on('click', this.goToPayment)
                .end()
                .add('.')
              .end()
            .end();
          })
        .end();
    }
  ],

  listeners: [
    function goToPayment() {
      window.open('https://www.payments.ca', '_blank');
    },
 ]
});
