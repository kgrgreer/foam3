foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'DynamicSixButtons',
  extends: 'foam.u2.Controller',

  documentation: `
    View to display DynamicSixButtons items for ablii, which is top portion of
    Dashboard.
  `,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.sme.ui.dashboard.ActionObject'
  ],

  imports: [
    'menuDAO',
    'pushMenu',
    'notify',
    'stack',
    'user',
    'userDAO'
    ],

  css: `
    ^container {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
    }
    ^item {
      flex-grow: 1;
      flex-basis: 0;
      display: flex;
      justify-content: center;
      text-align: center;
      flex-direction: column;
      height: 96px;
      border-radius: 4px;
      background-color: #ffffff;
      border: solid 1.5px #ffffff;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #edf0f5;
    }
    ^item:hover {
      cursor: pointer;
    }
    ^clickable {
      cursor: pointer;
    }
    ^item + ^item {
      margin-left: 16px;
    }
    ^item img {
      width: 37px;
      height: 37px;
      align-self: center;
    }
    ^item p {
      margin: 8px 0 0 0;
      font-size: 14px;
    }
    ^ .net-nanopay-ui-ActionView {
      height: 96px;
      width: 100%;
    }
    ^complete {

    }
    ^progress-bar {
      position: relative;
      height: 8px;
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
    }
    ^back {
      background-color: #e6e6e6;
      height: 8px;
      width: 100%;
    }
    ^front {
      background-color: #03cf1f;
      position: absolute;
      top: 0;
      left: 0;
      height: 8px;
    }
  `,

  messages: [
    {
      name: 'COMPLETION_SENTENCE',
      message: '/4 completed.'
    },
    {
      name: 'COMPLETION_SENTENCE_2',
      message: ' Complete all steps to unlock the full potential of Ablii.'
    },
    {
      name: 'HIDE',
      message: 'Hide'
    },
    { name: 'SINGULAR_BANK', message: 'Only 1 bank account can be added during the beta' }
  ],

  properties: [
    {
      name: 'actionsDAO',
      class: 'foam.dao.DAOProperty',
      factory: function() {
        return foam.dao.EasyDAO.create({
          of: net.nanopay.sme.ui.dashboard.ActionObject,
          cache: true,
          seqNo: true,
          daoType: 'MDAO'
        });
      }
    },
    {
      class: 'Int',
      name: 'completedCount'
    },
    {
      class: 'Boolean',
      name: 'allStepsComplete',
      expression: function(completedCount) {
        return completedCount === 4;
      }
    },
    {
      name: 'bankAction',
      documentation: `This a var to store the 'Add Banking' action. 
      Needed to confirm that the action was completed in THIS models standard action 'addBank'`
    }
  ],

  methods: [
    function initE() {
      var self = this;
      Promise.all([
        this.user.emailVerified,
        this.user.accounts
          .where(
            this.AND(
            this.OR(
              this.EQ(this.Account.TYPE, this.BankAccount.name),
              this.EQ(this.Account.TYPE, this.CABankAccount.name),
              this.EQ(this.Account.TYPE, this.USBankAccount.name)),
            this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED)))
          .select(this.COUNT()).then(({ value }) => value > 0),
        this.userDAO.find(this.user.id).then((use) => use.hasIntegrated),
        this.user.onboarded
      ]).then((values) => {
        this.completedCount = values.filter((val) => val).length;
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[0],
          act: this.VERIFY_EMAIL
        }));
        this.bankAction = net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[1],
          act: this.ADD_BANK
        });
        this.actionsDAO.put(this.bankAction);
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[2],
          act: this.SYNC_ACCOUNTING
        }));
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[3],
          act: this.BUS_PROFILE
        }));
        var dao = this.actionsDAO$proxy
          .orderBy(this.DESC(this.ActionObject.COMPLETED));
        this
          .addClass(this.myClass())
          .hide(this.allStepsComplete$)
          .start()
            .start()
              .addClass(this.myClass('progress-bar'))
              .start()
                .addClass(this.myClass('back'))
              .end()
              .start()
                .addClass(this.myClass('front'))
                .style({
                  width: `${Math.floor(parseInt(this.completedCount / 4 * 100))}%`
                })
              .end()
            .end()
          .end()
          .start('p')
            .addClass(this.myClass('container'))
            .start('span')
              .start('strong')
                .add(this.completedCount, this.COMPLETION_SENTENCE)
              .end()
              .start('span')
                .add(this.COMPLETION_SENTENCE_2)
              .end()
            .end()
            // Hide button will be hidden for now until we have time to build the real functionality
            .start('span').hide()
              .add(this.HIDE)
              .addClass(this.myClass('clickable'))
              .on('click', () => {
                this.allStepsComplete = true;
              })
            .end()
          .end()
          .start()
            .addClass(this.myClass('container'))
            .select(dao, function(actionObj) {
              return this.E()
                .addClass(self.myClass('item'))
                .enableClass(self.myClass('complete'), actionObj.completed)
                .start(actionObj.imgObj)
                  .addClass(self.myClass('icon'))
                  .show(actionObj.completed)
                .end()
                .start({ class: 'foam.u2.tag.Image', data: actionObj.act.icon })
                  .addClass(self.myClass('icon'))
                  .show(! actionObj.completed)
                .end()
                .start('p')
                  .add(actionObj.act.label)
                .end()
                .on('click', function() {
                  actionObj.act.maybeCall(self.__context__, self);
                });
            })
          .end();
      });
    },
  ],

  actions: [
    {
      name: 'verifyEmail',
      label: 'Verify Email',
      code: function() {
        // TODO
      }
    },
    {
      name: 'addBank',
      label: 'Add Banking',
      icon: 'images/bank_icon.svg',
      code: function() {
        if ( this.bankAction.completed ) {
          this.notify(this.SINGULAR_BANK, 'warning');
        } else {
          this.stack.push({
            class: 'net.nanopay.bank.ui.BankPickCurrencyView',
            usdAvailable: true,
            cadAvailable: true
          });
        }
      }
    },
    {
      name: 'syncAccounting',
      label: 'Sync Accounting',
      icon: 'images/ablii/sync-resting.svg',
      code: function() {
        this.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    },
    {
      name: 'addContacts',
      label: 'Add Contacts',
      code: function() {
        this.menuDAO
          .find('sme.main.contacts')
          .then((menu) => menu.launch());
      }
    },
    {
      name: 'busProfile',
      label: 'Business Profile',
      icon: 'images/Briefcase_Icon.svg',
      code: function() {
        if ( ! this.user.onboarded ) {
          this.stack.push({ class: 'net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard', hideTitles: true });
        } else {
          this.menuDAO.find('sme.accountProfile.business-settings').then((menu) => menu.launch());
        }
      }
    },
  ]
});
