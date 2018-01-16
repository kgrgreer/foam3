foam.CLASS({
  package: 'net.nanopay.admin',
  name: 'Data',

  imports: [
    'invoiceDAO',
    'topUpDAO',
    'transactionDAO',
    'menuDAO',
    'nSpecDAO',
    'userDAO'
  ],

  documentation: 'Temporary menu data.',

  methods: [
    function init() {
      this.SUPER();

      foam.json.parse([
        {
          id: 'top-up',
          label: 'Balance',
          order: 0,
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.admin.ui.topup.TopUpView' } }
        },
        {
          id: 'user',
          label: 'User',
          order: 10,
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.admin.ui.user.UserView' } }
        },
        {
          id: 'transaction',
          order: 20,
          label: 'Transaction',
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.admin.ui.transaction.TransactionView' } }
        },

        {
          id: 'popup',
          order: 30,
          label: 'Pop-up Demo',
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.admin.ui.settings.PopUp' } }
        },

        // Top Nav Sub-Menu
        {
          parent: 'settings',
          id: 'set-bank',
          label: 'Bank Account',
          order: 10,
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.admin.ui.settings.bankAccount.BankAccountSettingsView' } }
        },

        {
          parent: 'settings',
          id: 'change-password',
          label: 'Change Password',
          order: 20,
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'foam.nanos.auth.ChangePasswordView' } }
        },

        // User Account Sub-Menu
        {
          parent: 'accountSettings',
          id: 'verify-Account',
          label: 'Verify Account',
          order: 10,
          handler: { class: 'foam.u2.dialog.Popup', view: { class: 'net.nanopay.admin.ui.settings.bankAccount.dropdown.ChangeAccountNameView' } }
        },

        {
          parent: 'accountSettings',
          id: 'change-Account',
          label: 'Change Account',
          order: 20,
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.admin.ui.settings.bankAccount.dropdown.ChangeAccountNameView' } }
        },

        {
          parent: 'accountSettings',
          id: 'delete-Account',
          label: 'Delete Account',
          order: 30,
          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.admin.ui.settings.bankAccount.dropdown.DeleteBankAccountView' } }
        },

        // Transaction Sub-Menu
        {
          parent: 'transactionSubMenu',
          id: 'allTransactions',
          label: 'All',
          handler: {
            class: 'foam.nanos.menu.ViewMenu',
            view: { class: 'net.nanopay.admin.ui.transaction.TransactionView' }
          }
        },
        {
          parent: 'transactionSubMenu',
          id: 'topUps',
          label: 'Top Ups',
          handler: {
            class: 'foam.nanos.menu.ViewMenu',
            view: { class: 'net.nanopay.admin.ui.transaction.TransactionView' }
          }
        },
        {
          parent: 'transactionSubMenu',
          id: 'transactionShoppers',
          label: 'Shoppers',
          handler: {
            class: 'foam.nanos.menu.ViewMenu',
            view: { class: 'net.nanopay.admin.ui.transaction.TransactionView' }
          }
        },
        {
          parent: 'transactionSubMenu',
          id: 'transactionMerchants',
          label: 'Merchants',
          handler: {
            class: 'foam.nanos.menu.ViewMenu',
            view: { class: 'net.nanopay.admin.ui.transaction.TransactionView' }
          }
        },

        // User Sub-Menu
        {
          parent: 'userSubMenu',
          id: 'allUsers',
          label: 'All',
          handler: {
            class: 'foam.nanos.menu.ViewMenu',
            view: { class: 'net.nanopay.admin.ui.user.UserView' }
          }
        },
        {
          parent: 'userSubMenu',
          id: 'userShoppers',
          label: 'Shoppers',
          handler: {
            class: 'foam.nanos.menu.ViewMenu',
            view: { class: 'net.nanopay.admin.ui.user.UserView' }
          }
        },
        {
          parent: 'userSubMenu',
          id: 'userMerchants',
          label: 'Merchants',
          handler: {
            class: 'foam.nanos.menu.ViewMenu',
            view: { class: 'net.nanopay.admin.ui.user.UserView' }
          }
        },

      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));

      foam.json.parse([
        { name: 'hsm',   serve: false,  serviceClass: 'net.admin.hsmcore.ClusteredHSM' },
        { name: 'as',    serve: false,  serviceClass: 'net.admin.assetstore.HSMAssetStore' },
      ], foam.nanos.boot.NSpec, this.__context__).forEach(this.nSpecDAO.put.bind(this.nSpecDAO));

      var MS_PER_DAY = 1000 * 3600 * 24;

      this.__context__.businessDAO.select().then(function (bs) {
        var l = bs.array.length;

        for ( var i = 0 ; i < 50 ; i++ ) {
          var fi = 100+Math.floor(Math.random()*l);
          var ti = 100+Math.floor(Math.random()*l);
          var dd = new Date(Date.now() - 2*360*MS_PER_DAY*(Math.random()-0.1));
          var ed = new Date(Date.now() - 2*360*MS_PER_DAY*(Math.random()-0.1));
          var amount = Math.floor(Math.pow(10,3+Math.random()*4))/100;
          var phone1 = net.nanopay.model.Phone.create({ number: Math.floor(1000000000 + Math.random() * 9000000000) });
          var phone2 = net.nanopay.model.Phone.create({ number: Math.floor(1000000000 + Math.random() * 9000000000) });

          if ( ti === fi ) ti = ti === 100 ? 101 : ti-1;
          var inv = net.nanopay.admin.model.Invoice.create({
            draft:            Math.random()<0.002,
            invoiceNumber:    10000+i,
            purchaseOrder:    10000+i,
            fromBusinessId:   fi,
            toBusinessId:     ti,
            fromBusinessName: bs.array[fi-100].name,
            toBusinessName:   bs.array[ti-100].name,
            issueDate:        dd,
            amount:           amount
          });

          if ( Math.random() < 0.005 ) {
            inv.paymentId = -1;
          } else if ( Math.random() < 0.97 ) {
            inv.paymentDate = new Date(inv.issueDate.getTime() - ( 7 + Math.random() * 60 ) * MS_PER_DAY);
            if ( inv.paymentDate < Date.now() ) {
              inv.paymentId = inv.invoiceNumber;
            }
          }

          this.invoiceDAO.put(inv);

          // *** Admin Portal *** //
          // Top Up
          var topUp = net.nanopay.admin.model.TopUp.create({
            topUpNumber:      10000+i,
            issueDate:        dd,
            expectedDate:     ed,
            amount:           amount
          });

          this.topUpDAO.put(topUp);

          // TODO: Change payer/payee to Reference of 'foam.nanos.auth.User'
          //   && Setup Relationship. Needs development of User service so not
          //   yet possible.
          var payer = foam.nanos.auth.User.create({
            id:               50000+i+'',
            firstName:        bs.array[fi-100].name,
            type:             'Merchant',
            phone:            phone1.number,
            email:            'admin@' + bs.array[fi-100].name + '.com',
            profilePicture:   './images/business-placeholder.png'
          });

          var payee = foam.nanos.auth.User.create({
            id:               60000+i+'',
            firstName:        bs.array[ti-100].name,
            type:             'Shopper',
            phone:            phone2.number,
            email:            'admin@' + bs.array[ti-100].name + '.com',
            profilePicture:   './images/business-placeholder.png'
          });

          this.userDAO.put(payer);
          this.userDAO.put(payee);

          // Transaction
          var transaction = net.nanopay.tx.model.Transaction.create({
            id: 10000+i,
            date: dd,
            amount: amount,
            payer: payer.id,
            payee: payee.id
          });

          this.transactionDAO.put(transaction);

        }
      }.bind(this));
    }
  ]
});
