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
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.sme.ui.dashboard.ActionObject'
  ],

  imports: [
    'stack',
    'user'
  ],

  css: `
    ^container {
      display: flex;
      justify-content: space-between;
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
      width: 44px;
      height: 44px;
      align-self: center;
    }
    ^item p {
      margin: 8px 0 0 0;
    }
    ^ .net-nanopay-ui-ActionView {
      height: 96px;
      width: 100%;
    }
    ^complete {
      opacity: 0.3;
      border-radius: 4px;
      border: solid 1.5px #979797;
    }
    ^progress-bar {
      position: relative;
      height: 8px;
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
    }
    ^back {
      background-color: #d8d8d8;
      height: 8px;
      width: 100%;
    }
    ^front {
      background-color: #424242;
      position: absolute;
      top: 0;
      left: 0;
      height: 8px;
    }
  `,

  messages: [
    {
      name: 'COMPLETION_SENTENCE',
      message: '/6 completed. Complete all steps to unlock the full potential of Ablii.'
    },
    {
      name: 'HIDE',
      message: 'Hide'
    }
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
        return completedCount === 6;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      Promise.all([
        this.user.emailVerified,
        this.user.accounts
          .where(
            this.OR(
              this.EQ(this.Account.TYPE, this.BankAccount.name),
              this.EQ(this.Account.TYPE, this.CABankAccount.name)))
          .select(this.COUNT()).then(({ value }) => value > 0),
        false, // TODO: Accounting criteria.
        this.user.contacts.select(this.COUNT()).then(({ value }) => value > 0),
        this.user.compliance !== this.ComplianceStatus.PASSED,
        false // TODO: Add users to business criteria.
      ]).then((values) => {
        this.completedCount = values.filter((val) => val).length;
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[0],
          act: this.VERIFY_EMAIL
        }));
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[1],
          act: this.ADD_BANK
        }));
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[2],
          act: this.SYNC_ACCOUNTING
        }));
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[3],
          act: this.ADD_CONTACTS
        }));
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[4],
          act: this.BUS_PROFILE
        }));
        this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
          completed: values[5],
          act: this.ADD_USERS
        }));
        var dao = this.actionsDAO$proxy.orderBy(this.DESC(this.ActionObject.COMPLETED));
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
                  width: `${Math.floor(parseInt(this.completedCount / 6 * 100))}%`
                })
              .end()
            .end()
          .end()
          .start('p')
            .addClass(this.myClass('container'))
            .start('span')
              .add(this.completedCount, this.COMPLETION_SENTENCE)
            .end()
            .start('span')
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
                .start(actionObj.imgObjCompeleted)
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
      code: function() {
        this.stack.push({ class: 'net.nanopay.sme.ui.BankingView' });
      }
    },
    {
      name: 'syncAccounting',
      label: 'Sync Accounting',
      code: function() {
        // TODO
      }
    },
    {
      name: 'addContacts',
      label: 'Add Contacts',
      code: function() {
        this.stack.push({ class: 'net.nanopay.contacts.ui.ContactView' });
      }
    },
    {
      name: 'busProfile',
      label: 'Business Profile',
      code: function() {
        this.stack.push({ class: 'net.nanopay.settings.PersonalProfileView' });
      }
    },
    {
      name: 'addUsers',
      label: 'Add Users',
      code: function() {
        // TODO
      }
    },
  ]
});
