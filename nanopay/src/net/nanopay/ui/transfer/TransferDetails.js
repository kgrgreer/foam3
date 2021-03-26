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
  name: 'TransferDetails',
  extends: 'net.nanopay.ui.transfer.TransferView',

  documentation: 'Interac transfer details',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.ui.transfer.TransferUserCard',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.nanos.auth.User',
    'foam.dao.FnSink'
  ],

  imports: [
    'formatCurrency',
    'accountDAO as bankAccountDAO',
    'publicUserDAO',
    'balance',
    'user',
    'type',
    'balanceDAO',
    'currencyDAO',
    'currentAccount',
    'transactionDAO'
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
      height: 40px;
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

    ^ .confirmationContainer {
      margin-top: 18px;
      width: 100%;
    }

    ^ input[type='checkbox'] {
      display: inline-block;
      vertical-align: top;
      margin:0 ;
      border: solid 1px rgba(164, 179, 184, 0.75);
      cursor: pointer;
    }

    ^ input[type='checkbox']:checked {
      background-color: black;
    }

    ^ .confirmationLabel {
      display: inline-block;
      vertical-align: top;
      width: 80%;
      margin-left: 20px;
      font-size: 12px;
      cursor: pointer;
    }
    ^ .property-accounts{
      margin-top: 20px;
    }
    ^ .choice{
      margin-bottom: 20px;
    }
  `,

  messages: [
    { name: 'TransferFromLabel', message: 'Transfer from' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'ToLabel', message: 'To' },
    { name: 'FromLabel', message: 'From' },
    { name: 'PayeeLabel', message: 'Payee' },
    { name: 'PurposeLabel', message: 'Purpose of Transfer' },
    { name: 'NoteLabel', message: 'Notes (Optional)' },
    { name: 'NotThirdParty', message: 'Sending money on behalf of myself and not on behalf of a third party' },
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' },
    { name: 'PDFLabel', message: 'View Invoice PDF' }
  ],

  properties: [
    {
      name: 'formattedBalance',
      value: '...'
    },
    {
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.bankAccountDAO
          .where(
            this.AND(
              this.EQ(this.BankAccount.ID, newValue),
              this.EQ(this.BankAccount.OWNER, this.user.id)))
          .select()
          .then(function(a) {
            var account = a.array[0];
            self.viewData.account = account;
          });
      },
      view: function(_, X) {
        var expr = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.user.accounts
            .where(
              expr.EQ(
                net.nanopay.bank.BankAccount.STATUS,
                net.nanopay.bank.BankAccountStatus.VERIFIED)),
          objToChoice: function(account) {
            var length = account.accountNumber.length;
            return [
              account.id,
              account.name + ' ' + '***' +
                account.accountNumber.substring(length - 3)
            ];
          }
        });
      }
    },
    {
      name: 'payees',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.publicUserDAO
          .where(this.EQ(this.User.ID, newValue))
          .select()
          .then(function(a) {
            var payee = a.array[0];
            self.viewData.payee = payee;
            self.payeeCard.user = payee;
          });
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.data.publicUserDAO,
          objToChoice: function(payee) {
            var username = payee.firstName + ' ' + payee.lastName;
            if ( X.data.invoiceMode && ( payee.organization || payee.businessName ) ) {
              username = payee.organization || payee.businessName;
            }
            return [payee.id, username + ' - (' + payee.email + ')'];
          }
        });
      }
    },
    'payee',
    {
      name: 'payeeCard',
      factory: function() {
        return this.TransferUserCard.create();
      }
    },
    {
      // TODO: create a DAO to store these values so they can be more easily
      // extended.
      name: 'purpose',
      postSet: function(oldValue, newValue) {
        this.viewData.purpose = newValue;
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.transactionPurposeDAO,
          objToChoice: function(purpose) {
            return [purpose.id, purpose.purposeCode + ' - ' + purpose.description];
          }
        });
      }
    },
    {
      class: 'String',
      name: 'notes',
      postSet: function(oldValue, newValue) {
        this.viewData.notes = newValue;
      },
      view: { class: 'foam.u2.tag.TextArea' }
    },
    {
      class: 'Boolean',
      name: 'notThirdParty',
      value: false,
      postSet: function(oldValue, newValue) {
        this.viewData.notThirdParty = newValue;
      },
      validateObj: function(notThirdParty, invoiceMode) {
        if ( ! invoiceMode && ! notThirdParty ) {
          return 'Non-third party verification not checked.';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'digitalCash',
      documentation: 'UI toggle choice between payments using account or digital cash.',
      value: true,
      preSet: function(oldValue, newValue) {
        if ( ! this.accountCheck && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.digitalCash = newValue;
        if ( this.accountCheck ) this.accountCheck = false;
      }
    },
    {
      class: 'Boolean',
      name: 'accountCheck',
      documentation: 'UI toggle choice between payments using account or digital cash. Used to set bankAccountId on transaction on create.',
      value: false,
      preSet: function(oldValue, newValue) {
        if ( ! this.digitalCash && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.accountCheck = newValue;
        if ( this.digitalCash ) this.digitalCash = false;
      }
    }
  ],

  methods: [
    function init() {
      if ( this.viewData.payee ) {
        this.payees = this.viewData.payee.id;
      }

      if ( this.invoiceMode ) {
        this.payees = this.invoice.payeeId;
        this.viewData.fromAmount = this.invoice.amount;
      }

      if ( this.viewData.purpose ) {
        this.purpose = this.viewData.purpose;
      }

      if ( this.viewData.notes ) {
        this.notes = this.viewData.notes;
      }

      this.digitalCash = this.viewData.digitalCash;
      this.accountCheck = this.viewData.accountCheck;

      this.SUPER();
    },

    function initE() {
      this.SUPER();
      var self = this;
      this.getDefaultBank();

      this.transactionDAO.listen(this.FnSink.create({ fn: this.onDAOUpdate }));
      this.onDAOUpdate();
      this.currentAccount$.sub(this.onDAOUpdate);

      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(self.TransferFromLabel).addClass('bold').end()
           .start('p').add(self.AccountLabel).end()
          .start().addClass('choice')
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.digitalCash$ })
               .start('p').addClass('confirmationLabel').add('Digital Balance: ', this.formattedBalance$)
               .end()
            .end()
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.accountCheck$ })
              .start('p').addClass('confirmationLabel').add('Pay from account')
              .end()
            .end()
          .end()
          .start('div').addClass('dropdownContainer').show(this.accountCheck$)
            .start(self.ACCOUNTS).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.ToLabel).addClass('bold').end()
          .start('p').add(this.PayeeLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.PAYEES, {
              mode: this.invoiceMode ? foam.u2.DisplayMode.RO : undefined
            }).end()
            .start('div').enableClass('hidden', this.invoiceMode$).addClass('caret').end()
          .end()
          .start()
            .start('p').add(self.PurposeLabel).end()
            .start('div').addClass('dropdownContainer')
              .add(self.PURPOSE)
              .start('div').addClass('caret').end()
            .end()
          .end()
          .start('p').add(this.NoteLabel).end()
          .tag(this.NOTES, { onKey: true })
          .start('div').addClass('confirmationContainer').enableClass('hidden', this.invoiceMode$)
            .callIf(this.type == 'foreign', function() {
              this.tag({ class: 'foam.u2.md.CheckBox', data$: self.notThirdParty$ })
              .start('p').addClass('confirmationLabel').add(self.NotThirdParty)
                .on('click', function() {
                  self.notThirdParty = ! self.notThirdParty;
                })
              .end();
            })
          .end()
        .end()
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoice$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.invoiceNumber).end()
            .br()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.purchaseOrder).end()
          .end()
          .start('a').addClass('invoiceLink').enableClass('hidden', this.invoice$, true)
          .end()
          .start('p').add(this.FromLabel).addClass('bold').end()
          // TODO: Make card based on from and to information
          .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user$: this.user$ })
          .start('p').add(this.ToLabel).addClass('bold').end()
          .add(this.payeeCard)
        .end();
    },

    function getDefaultBank() {
      var self = this;
      this.bankAccountDAO.where(
        this.AND(
          this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED),
          this.EQ(this.BankAccount.OWNER, this.user)
        )
      ).select().then(function(a) {
        if ( a.array.length == 0 ) return;
        self.accounts = a.array[0].id;
        self.viewData.account = a.array[0];
      });
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function onDAOUpdate() {
        this.balanceDAO.find(this.currentAccount.id).then((balance) => {
          var amount = 0;

          if ( balance != null ) {
            this.balance.copyFrom(balance);
            amount = this.balance.balance;
          }

          this.currencyDAO
            .find(this.currentAccount.denomination)
            .then((currency) => {
              this.formattedBalance = currency.format(amount);
            });
        });
      }
    }
  ]
});
