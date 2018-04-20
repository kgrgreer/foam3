foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'BankAccountsView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying list of Bank Accounts added.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'stack',
    'bankAccountDAO'
  ],

  requires: [
    'net.nanopay.model.BankAccount'
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
    ^ h3 {
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      display: inline-block;
      vertical-align: top;
      margin: 0;
      margin-top: 20px;
    }
    ^ .bankContentCard {
      width: 234px;
      height: 100px;
      margin-right: 13.5px;
      float: left;
    }
    ^ .actionButton {
      width: 218px;
      height: 100px;
      float: right;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-create {
      visibility: hidden;
    }
    ^ .net-nanopay-ui-ActionView-addBank {
      margin: 0;
      background: none;
      outline: none;
      border: none;
      width: 218px;
      height: 100px;
      float: right;
      background-color: %SECONDARYCOLOR%;
      letter-spacing: 0.3px;
      color: #FFFFFF;
      border-radius: 2px;
      opacity: 1;
      font-weight: normal;
    }
    ^ .net-nanopay-ui-ActionView-addBank span {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
    }
    ^ .net-nanopay-ui-ActionView-addBank:hover {
      background: none;
      cursor: pointer;
      background-color: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .foam-u2-dialog-Popup-inner {
      background-color: transparent !important;
    }
    ^ .foam-u2-md-OverlayDropdown {
      width: 175px;
    }
    ^ .foam-u2-PopupView {
      padding: 0 !important;
      z-index: 10000;
      width: 152px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .foam-u2-PopupView > div {
      height: 30px;
      text-align: left;
      padding-left: 29px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
    }
    ^ .foam-u2-PopupView > div:hover {
      background-color: #59aadd;
      color: white;
      cursor: pointer;
    }
    ^ .foam-u2-PopupView::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      transform: translate(-24px, -106px);
    }
    ^ .foam-u2-view-TableView-row:hover {
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    'allBanksCount',
    'verifiedBanksCount',
    'unverifiedBanksCount',
    'disabledBanksCount',
    'selection',
    {
      name: 'data',
      factory: function () {
        return this.bankAccountDAO.where(this.EQ(this.BankAccount.OWNER, this.user.id));
      }
    }
  ],

  messages: [
    { name: 'TitleAll',         message: 'Total Bank Accounts' },
    { name: 'TitleVerified',    message: 'Verified Account(s)' },
    { name: 'TitleUnverified',  message: 'Unverified Account(s)' },
    { name: 'TitleDisabled', message: 'Disabled Account(s)' },
    { name: 'ActionAdd',        message: 'Add a new bank account' },
    { name: 'MyBankAccounts',   message: 'My Bank Accounts' },
    { name: 'placeholderText',  message: 'You don\'t have any bank accounts right now. Click the Add a bank account button to add a new bank account.' }
  ],

  methods: [
    function initE() {
      var self = this;
      this.data.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
          .start('div').addClass('row')
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleAll, content$: this.allBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleVerified, content$: this.verifiedBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleUnverified, content$: this.unverifiedBanksCount$ }).addClass('bankContentCard')
            .end()
            // .start('div').addClass('spacer')
            //   .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleDisabled, content$: this.disabledBanksCount$ }).addClass('bankContentCard')
            // .end()
            .start('div')
              .tag(this.ADD_BANK, { showLabel: true })
            .end()
          .end()
          .start()
            .tag({
                class: 'foam.u2.ListCreateController',
                dao: this.data,
                factory: function() { return self.BankAccount.create(); },
                detailView: {
                },
              summaryView: this.BankAccountTableView.create()
            })
          .end()
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.data, message: this.placeholderText, image: 'images/ic-bankempty.svg' })
    }

  ],

  actions: [
    {
      name: 'addBank',
      label: 'Add a bank account',
      icon: 'images/ic-plus.svg',
      code: function() {
        //this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.AddBankView', wizardTitle: 'Add Bank Account', startAtValue: 0 }, this);
        this.stack.push({class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true, hideBottomBar: true}, this);
      }
    }
  ],

  classes: [
    {
      name: 'BankAccountTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.model.BankAccount',
        'foam.u2.dialog.Popup',
        'foam.u2.dialog.NotificationMessage'
      ],

      imports: [
        'bankAccountDAO',
        'stack',
        'user'
      ],

      exports: [
        'selectedAccount',
        'verifyAccount',
        'manageAccountNotification'
      ],

      properties: [
        {
          name: 'selectedAccount'
        },
        {
          name: 'selection',
          preSet: function(oldValue, newValue) {
            if ( newValue && newValue.status != 'Disabled' ) {
              this.selectedAccount = newValue;
              this.manageAccount();
              return oldValue;
            }
          }
        },
        {
          name: 'data',
          factory: function() {
            return this.bankAccountDAO.where(this.EQ(this.BankAccount.OWNER, this.user.id));
          }
        }
      ],

      messages: [
        { name: 'TitleVerification', message: 'Verification' }
      ],

      methods: [
        function initE() {
          var self = this;

          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              data: this.data,
              selection$: this.selection$,
              columns: [
                'accountName', 'institutionNumber', 'transitNumber', 'accountNumber', 'status'
              ]
            }).addClass(this.myClass('table')).end();
        },

        function verifyAccount() {
          this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.AddBankView', wizardTitle: 'Verification', startAtValue: 2, nextLabelValue: 'Verify', backLabelValue: 'Come back later' }, this);
        },

        function manageAccount() {
          this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.bankAccount.ManageAccountModal' }).addClass('manageAccounts'));
        },

        function manageAccountNotification(_message, _type) {
          this.add(this.NotificationMessage.create({ message: _message, type: _type }));
        }
      ]
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.COUNT()).then(function(count) {
          self.allBanksCount = count.value;
        });

        var verifiedBanksDAO = this.data.where(this.EQ(this.BankAccount.STATUS, "Verified"));
        verifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.verifiedBanksCount = count.value;
        });

        var unverifiedBanksDAO = this.data.where(this.EQ(this.BankAccount.STATUS, "Unverified"));
        unverifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.unverifiedBanksCount = count.value;
        });

        var disabledBanksDAO = this.data.where(this.EQ(this.BankAccount.STATUS, "Disabled"));
        disabledBanksDAO.select(this.COUNT()).then(function(count) {
          self.disabledBanksCount = count.value;
        });
      }
    }
  ]
});
