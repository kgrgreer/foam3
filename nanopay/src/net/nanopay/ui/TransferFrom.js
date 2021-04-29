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
  package: 'net.nanopay.ui',
  name: 'TransferFrom',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Payer account selection',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.LoanAccount',
    'net.nanopay.bank.BankAccount',
    'foam.nanos.auth.User',
    'net.nanopay.ui.transfer.TransferUserCard',
    'foam.nanos.auth.UserUserJunction'
  ],

  imports: [
    'accountDAO',
    'userDAO',
    'user',
    'groupDAO',
    'type',
    'balanceDAO',
    'balance',
    'currencyDAO',
    'invoice',
    'invoiceMode',
    'partnerJunctionDAO'
  ],

  css: `
    ^ .property-notes {
      box-sizing: border-box;
      width: 320px;
      height: 66px;
      overflow-y: auto;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      resize: vertical;

      padding: 8px;
      outline: none;
    }

    ^ .property-notes:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-tag-Select {
      width: 320px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding: 12px 20px;
      padding-right: 35px;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      background-color: white;
      outline: none;
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }

    ^ .dropdownContainer {
      position: relative;
      margin-bottom: 20px;
    }

    ^ .caret {
      position: relative;
      pointer-events: none;
    }

    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 295px;
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

    ^ .choice{
      margin-bottom: 20px;
    }


    ^ .confirmationContainer {
      margin-top: 18px;
      width: 100%;
    }

    ^ .confirmationLabel {
      display: inline-block;
      vertical-align: top;
      width: 80%;
      margin-left: 20px;
      font-size: 12px;
      cursor: pointer;
    }

    // ^ input[type='checkbox'] {
    //   display: inline-block;
    //   vertical-align: top;
    //   margin:0 ;
    //   border: solid 1px rgba(164, 179, 184, 0.75);
    //   cursor: pointer;
    // }

    // ^ input[type='checkbox']:checked {
    //   background-color: black;
    // }

    ^ .half-small-input-box {
      width: 100%;
    }
    
    // ^ .dropdownContainer .foam-u2-view-RichChoiceView-container {
    //   z-index: 1;
    // }
    
    // ^ .dropdownContainer .foam-u2-view-RichChoiceView-selection-view {
    //   padding: 12px 20px;
    //   width: 320px; height: 40px;
    // }
    
    // ^ .dropdownContainer .foam-u2-view-RichChoiceView-chevron {
    //   display: none;
    // }
  `,

  messages: [
    { name: 'TransferFromLabel', message: 'Transfer from' },
    { name: 'TypeLabel', message: 'Type' },
    { name: 'DenominationLabel', message: 'Denomination' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'FromLabel', message: 'From' },
    { name: 'AmountLabel', message: 'Transfer Amount'},
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' }
  ],

  properties: [
    'payer',
    {
      class: 'Boolean',
      name: 'defaultAccountChosen', 
      value: false
    },
    {
      name: 'accountOwner',
      postSet: function(oldValue, newValue) {
        this.viewData.payer = newValue;
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, newValue || ''),
              this.AND(
                this.NOT(this.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
                this.NOT(this.INSTANCE_OF(net.nanopay.account.TrustAccount))
              )
            )
          )
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) {
              self.viewData.payerAccount = null;
            }  else {
              if ( self.types === undefined && self.viewData.payerType ) {
                self.types = self.viewData.payerType;
              } else {
                self.types = accounts[0].type;
              }
            }
          });
        this.userDAO
          .where(this.EQ(this.User.ID, newValue))
          .select()
          .then(function(u) {
            var users = u.array;
            if ( users.length > 0 ) {
              self.payer = users[0];
              self.viewData.payerCard = users[0];;
            } else {
              self.payer = null;
            }
          });
      }
    },
    {
      name: 'types',
      postSet: function(oldValue, newValue) {
        this.viewData.payerType = newValue;
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, this.accountOwner),
              this.EQ(this.Account.TYPE, newValue || '')
            )
          )
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.denominations === undefined && self.viewData.payerDenomination ) {
              self.denominations = self.viewData.payerDenomination;
            } else {
              self.denominations = accounts[0].denomination;
            }
          });
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.typeChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.typeChoices(view);
        });
        return view;
      }
    },
    {
      name: 'denominations',
      postSet: function(oldValue, newValue) {
        this.viewData.payerDenomination = newValue;     
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.AND(
                this.EQ(this.Account.TYPE, this.types),
                this.EQ(this.Account.DENOMINATION, newValue || '')), 
              this.EQ(this.Account.OWNER, this.accountOwner)))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.accounts === undefined && self.viewData.payerAccount ) {
              self.accounts = self.viewData.payerAccount;
            } else {
              self.accounts = accounts[0].id;
            }
          });
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.denominationChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.denominationChoices(view);
        });
        X.data.types$.sub(function() {
          X.data.denominationChoices(view);
        });
        return view;
      }
    },
    {
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        this.viewData.payerAccount = newValue;
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.accountChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.accountChoices(view);
        });
        X.data.types$.sub(function() {
          X.data.accountChoices(view);
        });
        X.data.denominations$.sub(function() {
          X.data.accountChoices(view);
        });
        return view;
      }
    },
    {
      class: 'UnitValue',
      name: 'transferAmount',
      postSet: function(oldValue, newValue) {
        this.viewData.fromAmount = newValue;
      }
    }
  ],

  methods: [
    function init() {
      if ( this.viewData.fromAmount ) {
        this.transferAmount = this.viewData.fromAmount;
      } else {
        this.viewData.fromAmount = 0;
      }

      this.accountOwner =  this.user.id;

      this.SUPER();
    },

    function initE() {
      // this.checkPermission();
      this.SUPER();

      this.accounts$.sub(this.onAccountUpdate);
      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferFromLabel).addClass('bold').end()
     
          .start('p').add(this.TypeLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.TYPES).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.DenominationLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.DENOMINATIONS).end()
            .start('div').addClass('caret').end()
          .end()
          .br()

          .start('p').add(this.AccountLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.ACCOUNTS).end()
            .start('div').addClass('caret').end()
          .end()

          .start().enableClass('hidden', this.invoice$, false)
            .start('p').add(this.AmountLabel).end()
            .start(this.TRANSFER_AMOUNT).addClass('half-small-input-box').end()
          .end()

        .end()
        
        .start('div').enableClass('divider', this.payer$).end()
        .start('div').addClass('fromToCol')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoice$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.invoiceNumber).end()
            .br()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.purchaseOrder).end()
          .end()
          .start().enableClass('hidden', this.payer$.map(function(value) {
            return value ? false : true;
          }))
            .start('p').add(this.FromLabel).addClass('bold').end()
            .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user$: this.payer$ })
          .end()
        .end();
    },
  ],

  listeners: [
    {
      name: 'onAccountUpdate',
      code: function onAccountUpdate() {
        var self = this;
        this.balanceDAO.find(this.accounts).then(function(balance) {
          var amount = (balance != null ? balance.balance : 0);
          if ( ! self.defaultAccountChosen
            && self.types == 'DigitalAccount'
            && ( amount == 0 || ( self.invoice && amount < self.invoice.amount ))) {
              self.accountDAO
              .where(
                self.AND(
                  self.EQ(self.Account.OWNER, self.accountOwner),
                  self.AND(
                    self.INSTANCE_OF(self.BankAccount),
                    self.EQ(self.Account.IS_DEFAULT, true))))
              .select()
              .then(function(a) {
                var accounts = a.array;
                if ( accounts.length > 0 ) self.types = accounts[0].type;
              })
          }
          self.defaultAccountChosen = true;
          self.viewData.balance = amount;
        });
      }
    },

    async function accountChoices(view) {
      var a = await this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner || ''),
            this.AND(
              this.EQ(this.Account.DENOMINATION, this.denominations || ''),
              this.EQ(this.Account.TYPE, this.types || ''))))
        .select();
      var accounts = a.array;
      var length = accounts.length;
      var type = this.types;
      if ( type == 'DigitalAccount' ) {
        let choices = [];
        for ( var i = 0; i < length; ++i ) {
          let account = accounts[i];
          let balance = await account.findBalance(this);
          let currency = await this.currencyDAO.find(account.denomination);
          let name = account.name ? account.name : 'Digital Account';
          choices.push(
            [account.id,
            name + ': ' + currency.format(balance)]);
        }
        if ( this.types == 'DigitalAccount' ) view.choices = choices;
      }

      if ( type.length >= 11 && type.substring(type.length - 11) == 'BankAccount')  {
        view.choices = accounts.map(account => {
          var choice = `${account.name} ${this.BankAccount.mask(account.accountNumber)}`;
          return [account.id, choice];
        });
      }

      if ( type == 'LoanAccount') {
        let choices = [];
        for ( var i = 0; i < length; ++i ) {
          let account = accounts[i];
          let balance = await account.findBalance(this);
          let currency = await this.currencyDAO.find(account.denomination);
          let name = account.name ? account.name : 'Loan Account';
          choices.push(
            [account.id,
            name + ' Limit Left: ' + currency.format(account.principal + balance)]);
        }
        if ( this.types == 'LoanAccount' ) view.choices = choices;
      }
    },

    function typeChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner || ''),
            this.AND(
              this.NOT(this.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
              this.NOT(this.INSTANCE_OF(net.nanopay.account.TrustAccount))
            )
          )
        )
        .select(this.GROUP_BY(net.nanopay.account.Account.TYPE, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(t) {
            var strArray = t.match(/[A-Z][a-z]+|[0-9]+/g);
            var accountType = strArray.join(" ");
            var index = t.indexOf(strArray[0]);
            if ( index > 0 ) accountType = t.substr(0, index) + " " + accountType;
            return [t, accountType];
        });
      });
    },

    function denominationChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner|| ''),
            this.EQ(this.Account.TYPE, this.types || '')))
        .select(this.GROUP_BY(net.nanopay.account.Account.DENOMINATION, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(d) {
            return [d, d];
        });
      });
    }
  ]
});