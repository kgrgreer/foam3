foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'DynamicSixButtons',
  extends: 'foam.u2.Controller',

  documentation: `View to display DynamicSixButtons items for ablii, which is top portion of Dashboard`,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.sme.ui.dashboard.ActionObject',
  ],

  css: `
    ^ .searchIcon {
      position: absolute;
      margin-left: 64px;
      margin-top: 20px;
    }
    ^ .net-nanopay-ui-ActionView {
      padding: 40px;
      margin: 10px;
    }
    `,

  properties: [
    {
      name: 'actionsDAO',
      class: 'foam.dao.DAOProperty',
      factory: function() {
        var actArray = foam.dao.EasyDAO.create({
          of: net.nanopay.sme.ui.dashboard.ActionObject,
          cache: true,
          seqNo: true,
          daoType: 'MDAO'
        });
        actArray.put(net.nanopay.sme.ui.dashboard.ActionObject.create({ name: 'verE', completed: this.verifyEmailBo, act: this.VERIFY_EMAIL }));
        actArray.put(net.nanopay.sme.ui.dashboard.ActionObject.create({ name: 'addB', completed: this.addBankBo, act: this.ADD_BANK }));
        actArray.put(net.nanopay.sme.ui.dashboard.ActionObject.create({ name: 'sync', completed: this.syncAccountingBo, act: this.SYNC_ACCOUNTING }));
        actArray.put(net.nanopay.sme.ui.dashboard.ActionObject.create({ name: 'addC', completed: this.addContactsBo, act: this.ADD_CONTACTS }));
        actArray.put(net.nanopay.sme.ui.dashboard.ActionObject.create({ name: 'busP', completed: this.busProfileBo, act: this.BUS_PROFILE }));
        actArray.put(net.nanopay.sme.ui.dashboard.ActionObject.create({ name: 'addU', completed: this.addUsersBo, act: this.ADD_USERS }));
        return actArray;
      }
    },
    {
      name: 'verifyEmailBo',
      class: 'Boolean'
    },
    {
      name: 'addBankBo',
      class: 'Boolean'
    },
    {
      name: 'syncAccountingBo',
      class: 'Boolean'
    },
    {
      name: 'addContactsBo',
      class: 'Boolean'
    },
    {
      name: 'busProfileBo',
      class: 'Boolean'
    },
    {
      name: 'addUsersBo',
      class: 'Boolean'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this.select(this.actionsDAO$proxy.orderBy(
        this.DESC(this.ActionObject.COMPLETED)), function(action) {
        var imgg = ! action.completed;
        return this.E()
          .start('span')
            .start(action.imgObj)
              .addClass('searchIcon').show(action.completed)
            .end()
            .start(action.imgObjCompeleted)
              .addClass('searchIcon').show(imgg)
            .end()
            .startContext({ data: self })
              .start(action.act)
            .endContext()
          .end();
      });
},
  ],

  actions: [
    {
      name: 'verifyEmail',
      label: 'Verify Email',
      code: async function() {
        await this.actionsDAO.where(this.EQ(this.ActionObject.NAME, 'verE')).select().then(
          (actObj) => {
            actObj.array[0].completed = (true);
            this.actionsDAO.put(actObj);
          }
        );
      }
    },
    {
      name: 'addBank',
      label: 'Add Banking',
      code: async function() {
        await this.actionsDAO.where(this.EQ(this.ActionObject.NAME, 'addB')).select().then(
          (actObj) => {
            actObj.array[0].completed = (true);
            this.actionsDAO.put(actObj);
          }
        );
      }
    },
    {
      name: 'syncAccounting',
      label: 'Sync Accounting',
      code: async function() {
        await this.actionsDAO.where(this.EQ(this.ActionObject.NAME, 'sync')).select().then(
          (actObj) => {
            actObj.array[0].completed = (true);
            this.actionsDAO.put(actObj);
          }
        );
      }
    },
    {
      name: 'addContacts',
      label: 'Add Contacts',
      code: async function(X) {
        await this.actionsDAO.where(this.EQ(this.ActionObject.NAME, 'addC')).select().then(
          (actObj) => {
            actObj.array[0].completed = (true);
            this.actionsDAO.put(actObj);
          }
        );
      }
    },
    {
      name: 'busProfile',
      label: 'Business Profile',
      code: async function() {
        await this.actionsDAO.where(this.EQ(this.ActionObject.NAME, 'busP')).select().then(
          (actObj) => {
            actObj.array[0].completed = (true);
            this.actionsDAO.put(actObj);
          }
        );
      }
    },
    {
      name: 'addUsers',
      label: 'Add Users',
      code: async function() {
        await this.actionsDAO.where(this.EQ(this.ActionObject.NAME, 'addU')).select().then(
          (actObj) => {
            actObj.array[0].completed = (true);
            this.actionsDAO.put(actObj);
          }
        );
      }
    },
  ]

});
