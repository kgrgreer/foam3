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
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferDetails',
  extends: 'net.nanopay.interac.ui.etransfer.TransferView',

  documentation: 'Interac transfer details',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.interac.model.Pacs008ISOPurpose',
    'net.nanopay.interac.model.Pacs008IndiaPurpose',
    'net.nanopay.interac.ui.shared.TransferUserCard',
    'net.nanopay.model.BankAccount',
    'foam.nanos.auth.User'
  ],

  imports: [
    'pacs008ISOPurposeDAO',
    'pacs008IndiaPurposeDAO',
    'bankAccountDAO',
    'userDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
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
      */}
    })
  ],

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
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.bankAccountDAO.where(this.EQ(this.BankAccount.ID, newValue)).select().then(function(a){
          var account = a.array[0];
          self.viewData.account = account;
        });
      },
      view: function(_,X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.data.bankAccountDAO.where(X.data.EQ(X.data.BankAccount.ID, 1)),
          objToChoice: function(account) {
            return [
              account.id,
              `Account No. ${X.BankAccount.mask(account.accountNumber)}`
            ]; // TODO: Grab amount and display
          }
        });
      }
    },
    {
      name: 'payees',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.userDAO.where(this.EQ(this.User.ID, newValue)).select().then(function(a){
          var payee = a.array[0];
          self.viewData.payee = payee;
          self.payeeCard.user = payee;
        });
      },
      view: function(_,X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.data.userDAO.where(X.data.NEQ(X.data.User.ID, 1)),
          objToChoice: function(payee) {
            var username = payee.firstName + ' ' + payee.lastName;
            if ( X.data.invoiceMode ) {
              // if organization exists, change name to organization name.
              if ( payee.organization ) username = payee.organization;
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
      // TODO: create a DAO to store these values so they can be more easily extended.
      name: 'purpose',
      postSet: function(oldValue, newValue) {
        this.viewData.purpose = newValue;
      },
      view: function(_,X) {
        var type = X.data.invoice ? 'Organization' : 'Individual';
        return foam.u2.view.ChoiceView.create({
          dao: X.data.pacs008IndiaPurposeDAO.where(X.data.EQ(X.data.Pacs008IndiaPurpose.TYPE, type)),
          objToChoice: function(purpose) {
            return [purpose.code, purpose.code + ' - ' + purpose.description];
          }
        })
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
        if ( ! invoiceMode && ! notThirdParty ) return 'Non-third party verification not checked.'
      }
    }
  ],

  methods: [
    function init() {
      var self = this;
      var initSuper = this.SUPER;
      if ( this.viewData.payee ) {
        this.payees = this.viewData.payee.id;
      }

      if ( this.invoiceMode ) {
        this.payees = this.invoice.toBusinessId;
      }

      if ( this.viewData.purpose ) {
        this.purpose = this.viewData.purpose;
      }

      if ( this.viewData.notes ) {
        this.notes = this.viewData.notes;
      }

      this.userDAO.find(1).then(function(user) {
        self.fromUser = user;
      });
      this.SUPER()
    },

    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferFromLabel).addClass('bold').end()
          .start('p').add(this.AccountLabel).end()
          .start('div').addClass('dropdownContainer')
            .add(this.ACCOUNTS)
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.ToLabel).addClass('bold').end()
          .start('p').add(this.PayeeLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.PAYEES, { mode: this.invoiceMode ? foam.u2.DisplayMode.RO : undefined }).end()
            .start('div').enableClass('hidden', this.invoiceMode$).addClass('caret').end()
          .end()
          .start('p').add(this.PurposeLabel).end()
          .start('div').addClass('dropdownContainer')
            .add(this.PURPOSE)
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.NoteLabel).end()
          .tag(this.NOTES, { onKey: true })
          .start('div').addClass('confirmationContainer').enableClass('hidden', this.invoiceMode$)
            .tag({ class: 'foam.u2.CheckBox', data$: this.notThirdParty$ })
            .start('p').addClass('confirmationLabel').add(this.NotThirdParty)
              .on('click', function() {
                self.notThirdParty = ! self.notThirdParty;
              })
            .end()
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
            .attrs({href: this.viewData.invoiceFileUrl})
            .add(this.PDFLabel)
          .end()
          .start('p').add(this.FromLabel).addClass('bold').end()
          // TODO: Make card based on from and to information
          .tag({ class: 'net.nanopay.interac.ui.shared.TransferUserCard', user: this.fromUser })
          .start('p').add(this.ToLabel).addClass('bold').end()
          .add(this.payeeCard)
        .end();
    }
  ]
});
