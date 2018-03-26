foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankPadAuthorization',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input bank account details.',
  
  import:[
    'user',
    'viewData',
    'regionDAO',
    'countryDAO',
    'window'
  ],
  css: `
    ^ .col {
      display: inline-block;
      width: 357px;
      vertical-align: top;
    }

    ^ .colSpacer {
      margin-left: 30px;
    }

    ^ input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 40px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding: 0 15px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      background-color: white;
      outline: none;
    }

    ^ .institutionContainer {
      position: relative;
    }

    ^ .foam-u2-tag-Select:hover {
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-TextField {
      outline: none;
      height: 40px;
      padding: 10px;
    }

    ^ .instituteOtherMargin {
      margin-left: 150px;
    }

    ^ .headings {
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      padding-bottom: 6px;
      margin: 14px 0px ;

    }
    
    ^ .messageBody {
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      margin-top:0px
    }
    ^ .full-width-input{
      width: 498px;
      left: -26px;
      position: relative;
      font-size: 14px;
      margin-top: 8px;
    }
    ^ .inputLarge{
      margin-bottom: 20px;
      font-size: 14px;
      margin-top: 10px;
    }
    ^ .full-width-input-label{
      width: 474px;
      height: 17px;
      position: relative;
      font-size: 14px;
      margin: 8px 0px 20px 0px;
    }
    ^ .inputLarge-label{
      height: 17px;
      margin-bottom: 20px;
      font-size: 14px;
      margin-top: 10px;
      width: 196px
    }
    ^ .regionContainer {
      position: relative;
      margin-bottom: 20px;
    }
    ^ .countryContainer {
      position: relative;
      margin-bottom: 20px;
    }
    ^ .caret {
      position: relative;
    }
    ^ .caret:before {
      content: '';
      position: absolute;
      top: -32px;
      left: 190px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }
    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }
    ^ .longcaret {
      position: relative;
    }
    ^ .longcaret:before {
      content: '';
      position: absolute;
      top: -32px;
      left: 472px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }
    ^ .longcaret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }
    ^ .property-region{
      padding: 10px 0px;
      width: 218px;
    }
    ^ .property-country{
      padding: 10px 0px;
      width: 497px;
    }
    ^ .infoContainer-wizard{
      width: 496px;
      background: white;
      border-radius: 2px;
      overflow-y: scroll;
      padding: 20px;
    }
    ^ .notEditable{
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.17;
      letter-spacing: 0.2px;
      background-color: #ffffff;
      color: #a4b3b8;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 10px;
    }
    ^ .header{
      padding-bottom: 10px;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.17;
      letter-spacing: 0.2px;
      background-color: #ffffff;
    }
    ^ .link{
      color: #59a5d5;
    }
  `,

  messages: [
    { name: 'Step1',                message: 'Step ' },
    { name: 'Step2',                message: ' : Pre-authorized debit confirmation' },
    { name: 'LabelFirstName',       message: 'First Name' },
    { name: 'LabelLastName',        message: 'Last Name' },
    { name: 'LabelCountry',         message: 'Country' },
    { name: 'LabelStreetNumber',    message: 'Street Number' },
    { name: 'LabelStreetName',      message: 'Street Name' },
    { name: 'LabelSuite',           message: 'Suite' },
    { name: 'LabelCity',            message: 'City' },
    { name: 'LabelRegion',          message: 'Region' },
    { name: 'LabelPostal',          message: 'Postal Code' },
    { name: 'LabelAccount',         message: 'Account Number' },
    { name: 'LabelInstitute',       message: 'Institution Number' },
    { name: 'LabelTransit',         message: 'Transit Number' },    
    { name: 'TC1',                  message: 'I authorize nanopay Corporation to withdraw from my (debit)account with the financial institution listed above from time to time for the amount that I specify when processing a one-time ("sporadic") pre-authorized debit.'},
    { name: 'TC2',                  message: 'I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD Agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit '},
    { name: 'TC3',                  message: 'This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation or by visiting '},
    { name: 'link',                 message: 'www.payments.ca.'},

  ],
  properties:[
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
          dao: X.countryDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
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
          dao: X.regionDAO.where(expr.EQ(foam.nanos.auth.Region.COUNTRY_ID, 'CA')),
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
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
          .start().addClass('inline float-right')
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

          .start().addClass('inline ')
            .start().add(this.LabelStreetNumber).addClass('infoLabel').end()
            .start(this.STREET_NUMBER).addClass('inputLarge').end()
          .end()
          .start().addClass('inline float-right')
            .start().add(this.LabelStreetName).addClass('infoLabel').end()
            .start(this.STREET_NAME).addClass('inputLarge').end()
          .end()

          .start().addClass('inline ')
            .start().add(this.LabelSuite).addClass('infoLabel').end()
            .start(this.SUITE).addClass('inputLarge').end()
          .end()
          .start().addClass('inline float-right')
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
          .start().addClass('inline float-right')
            .start().add(this.LabelPostal).addClass('infoLabel').end()
            .start(this.POSTAL_CODE).addClass('inputLarge').end()
          .end()

          .start('p').add('Banking Info').addClass('headings').end()
          .start('div').forEach( this.viewData.bankAccount, function(data, index){
            this
            .callIf( ! (self.viewData.bankAccount.length === 1), function(){
              this.start().add('Account '+ (index+1) ).addClass('header').end()
            }) 
            .start().addClass('inline')
              .start().add(self.LabelInstitute).addClass('infoLabel').end()
              .start().add(data.institutionNumber).addClass('notEditable full-width-input-label').end()
            .end()
            .start().addClass('inline')
              .start().add(self.LabelTransit).addClass('infoLabel').end()
              .start().add(data.transitNumber).addClass('notEditable inputLarge-label').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(self.LabelAccount).addClass('infoLabel').end()
              .start().add(data.accountNumber).addClass('notEditable inputLarge-label').end()
            .end()
          }).end()

          .start('div').addClass('row').addClass('rowTopMarginOverride')
            .start('p')
              .add('Authorization').addClass('headings')
              .start('p').addClass('messageBody').add(this.TC1).end()
            .end()
            .start('p')
              .add('Recourse/Reimbursement').addClass('headings')
              .start('p').addClass('messageBody').add(this.TC2).start('a').addClass('messageBody link').add(this.link).on('click',this.goToPayment).end().end()
            .end()
            .start('p')
              .add('Cancellation').addClass('headings')
              .start('p').addClass('messageBody').add(this.TC3).start('a').addClass('messageBody link').add(this.link).on('click',this.goToPayment).end().end()
            .end()
          .end() 
        .end()
    }
  ],
  listeners: [
    function goToPayment () {
      window.open('https://www.payments.ca','_blank');
    },
 ]
});
