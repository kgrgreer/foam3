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
  package: 'net.nanopay.ui.transfer',
  name: 'TransferUserCard',
  extends: 'foam.u2.Controller',

  documentation: 'User card used in transfers',

  imports: [
    'balanceDAO',
    'branchDAO',
    'invoiceMode',
    'type'
  ],

  requires: [
    'net.nanopay.bank.BankAccount'
  ],

  css: `
    ^ .userContainer {
      box-sizing: border-box;
      border-radius: 2px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      margin-bottom: 20px;
      width: 300px;
      padding: 20px;
    }

    ^ .userRow {
      margin-bottom: 20px;
    }

    ^ .userName {
      display: inline-block;
      margin-bottom: 0 !important;
    }

    ^ .nationalityContainer {
      display: inline-block;
      vertical-align: top;
      float: right;
    }

    ^ .nationalityLabel {
      display: inline-block;
      vertical-align: top;
      margin: 0;
      margin-left: 5px;
    }

    ^ .pDetails {
      opacity: 0.7;
      font-size: 12px;
      line-height: 1.17;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .bold {
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 0.4px;
      opacity: 1;
    }

    ^ .bankInfoContainer {
      margin-top: 18px;
      width: 100%;
    }

    ^ .bankInfoRow {
      width: 100%;
      margin-bottom: 5px;
    }

    ^ .bankInfoRow:last-child {
      margin-bottom: 0;
    }

    ^ .bankInfoText {
      display: inline-block;
      vertical-align: top;
      margin: 0;
    }

    ^ .bankInfoLabel {
      width: 85px;
    }
  `,

  properties: [
    'user',
    'idLabel_',
    'name_',
    'email_',
    'phoneNumber_',
    'flagURL_',
    {
      name: 'suite_',
      value: ''
    },
    {
      name: 'address1_',
      value: ''
    },
    {
      name: 'address2_',
      value: ''
    },
    {
      name: 'city_',
      value: ''
    },
    {
      name: 'postalCode_',
      value: ''
    },
    {
      name: 'regionCountry_',
      value: ''
    },
    'nationality_',
    {
      name: 'created_',
      value: false
    },
    'accountId_',
    'accountNo_',
    'bankName_',
    'account'
  ],

  methods: [
    function init() {
      this.SUPER();
      this.user$.sub(this.userUpdate);
      this.userUpdate();
    },

    function createView() {
      if ( this.created_ ) return;
      this
        .addClass(this.myClass())
        .start('div').addClass('userContainer')
          .start('div').addClass('userRow')
            .start('p').addClass('bold').addClass('userName').add(this.name_$).end()
            .start('div').addClass('nationalityContainer').show(this.type == 'foreign')
              .start({ class: 'foam.u2.tag.Image', data: this.flagURL_$ }).end() // TODO: Make it dynamic
              .start('p').addClass('pDetails').addClass('nationalityLabel').add(this.nationality_$).end() // TODO: Make it dyamic.
            .end()
          .end()
          .start('p').addClass('pDetails').add(this.email_$).end()
          .start('p').addClass('pDetails').add(this.phoneNumber_$).end()
          .start('p').addClass('pDetails').add(this.suite_$).end()
          .start('p').addClass('pDetails').add(this.address1_$).end()
          .start('p').addClass('pDetails').add(this.address2_$).end()
          .start('p').addClass('pDetails').add(this.city_$).end()
          .start('p').addClass('pDetails').add(this.postalCode_$).end()
          .start('p').addClass('pDetails').add(this.regionCountry_$).end()
          .start('div').addClass('bankInfoContainer').show(this.accountNo_$ && this.type == 'foreign')
            .start('div').addClass('bankInfoRow')
              .start('p').addClass('pDetails').addClass('bankInfoText').addClass('bankInfoLabel').addClass('bold')
                .add(this.idLabel_$)
              .end()
              .start('p').addClass('pDetails').addClass('bankInfoText')
                .add(this.accountId_$)
              .end()
            .end()
            .start('div').addClass('bankInfoRow')
              .start('p').addClass('pDetails').addClass('bankInfoText').addClass('bankInfoLabel').addClass('bold')
                .add('Account No.')
              .end()
              .start('p').addClass('pDetails').addClass('bankInfoText')
                .add(this.accountNo_$)
              .end()
            .end()
            .start('div').addClass('bankInfoRow')
              .start('p').addClass('pDetails').addClass('bankInfoText').addClass('bankInfoLabel').addClass('bold')
                .add('Bank Name')
              .end()
              .start('p').addClass('pDetails').addClass('bankInfoText')
                .add(this.bankName_$)
              .end()
            .end()

          .end()
        .end();
      this.created_ = true;
    },

    function setBankInfo(account) {
      var self = this;
      self.accountNo_ = this.bankAccount.mask(account.accountNumber);
      self.branchDAO.find(account.branchId).then(function(bank) {
        switch ( self.user.address.countryId ) {
          case 'CA':
            self.flagURL_ = 'images/canada.svg';
            self.nationality_ = 'Canada';
            self.idLabel_ = 'FI ID';
            self.accountId_ = bank.memberIdentification + ' - ' + bank.branchId;
            break;
          case 'IN':
            self.flagURL_ = 'images/india.svg';
            self.nationality_ = 'India';
            self.idLabel_ = 'IFSC ID';
            self.accountId_ = bank.memberIdentification;
            break;
        }
        self.bankName_ = bank.name;
      });
    },

    function resetUser() {
      this.suite_ = '';
      this.address1_ = '';
      this.address2_ = '';
      this.city_ = '';
      this.postalCode_ = '';
      this.regionCountry_ = '';
      this.name_ = null;
      this.idLabel_ = null;
      this.accountId_ = null;
      this.accountNo_ = null;
      this.bankName_ = null;
      this.flagURL_ = null;
      this.nationality_ = null;
      this.idLabel_= null;
    }
  ],

  listeners: [
    {
      name: 'userUpdate',
      code: function() {
        if ( ! this.user ) return;
        this.resetUser();
        this.name_ = this.user.firstName + ' ' + this.user.lastName;

        if ( this.invoiceMode ) {
          // If organization exists, change name to organization name.
          if ( this.user.organization ) this.name_ = this.user.organization;
        }
        this.email_ = this.user.email;

        var phonePropertyName = this.invoiceMode ?
          'businessPhoneNumber' :
          'phoneNumber';
        var addressPropertyName = this.invoiceMode ?
          'businessAddress' :
          'address';

        if ( this.user[phonePropertyName] ) {
          this.phoneNumber_ = this.user[phonePropertyName];
        }

        if ( this.user[addressPropertyName] ) {
          var address = this.user[addressPropertyName];

          if ( address.structured ) {
            if ( address.suite ) this.suite_ = 'Suite/Unit ' + address.suite;
            if ( address.streetNumber ) this.address1_ = address.streetNumber + ' ';
            if ( address.streetName ) this.address1_ += address.streetName;
          } else {
            if ( address.address1 ) this.address1_ = address.address1;
            if ( address.address2 ) this.address2_ = address.address2;
          }

          if ( address.city ) this.city_ = address.city;
          if ( address.postalCode ) this.postalCode_ = address.postalCode;
          if ( address.regionId ) this.regionCountry_ = address.regionId;
          if ( address.countryId ) this.regionCountry_ += ', ' + address.countryId;
        }

        this.createView();
      }
    }
  ]
});
