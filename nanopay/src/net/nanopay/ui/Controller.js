foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',
  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },
  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.client.Client',
    'net.nanopay.util.CurrencyFormatter'
  ],

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.model.Account',
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Currency'
  ],

  exports: [
    'account',
    'as ctrl',
    'requestLogin',
    'loginSuccess',
    'stack',
    'user',
    'logo',
    'signUpEnabled',
    'webApp',
    'wrapCSS as installCSS'
  ],

  imports: [
    'sessionSuccess',
    'installCSS'
  ],

  css: `
    .stack-wrapper {
      margin-bottom: -10px;
      min-height: calc(80% - 60px);
    }

    .stack-wrapper:after {
      content: "";
      display: block;
    }

    .stack-wrapper:after, .net-nanopay-b2b-ui-shared-FooterView {
      height: 10px;
    }

    .foam-comics-DAOUpdateControllerView .property-transactionLimits .net-nanopay-ui-ActionView-addItem {
      height: auto;
      padding: 3px;
      width: auto;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row {
      height: 40px;
    }

    .foam-u2-view-TableView .net-nanopay-ui-ActionView {
      height: auto;
      padding: 8px;
      width: auto;
    }
  `,

  properties: [
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function() { return this.User.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.model.Account',
      name: 'account',
      factory: function() { return this.Account.create(); }
    },
    {
      class: 'Boolean',
      name: 'loginSuccess',
      value: false
    },
    'logo',
    'primaryColor',
    'secondaryColor',
    'tableColor',
    'accentColor',
    'webApp',
    {
      class: 'Boolean',
      name: 'signUpEnabled',
      adapt: function(v) {
        return v === 'false' ? false : true;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var self = this;
      foam.__context__.register(net.nanopay.ui.ActionView, 'foam.u2.ActionView');

      // get current user, else show login
      this.auth.getCurrentUser(null).then(function (result) {
        self.loginSuccess = result ? true : false;
        self.user.copyFrom(result);
        return self.accountDAO.where(self.EQ(self.Account.OWNER, self.user.id)).limit(1).select();
      })
      .then(function (result) {
        self.account.copyFrom(result.array[0]);
      })
      .catch(function (err) {
        self.requestLogin();
      });

      window.onpopstate = function(event) {
        if ( location.hash != null ) {
          var hid = location.hash.substr(1);

          hid && self.menuDAO.find(hid).then(function(menu) {
            menu && menu.launch(this,null);
         })
        }
      };
      net.nanopay.TempMenu.create(null, this);
      window.onpopstate();
    },

    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.ui.topNavigation.TopNav' })
        .br()
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end()
        .br()
        .tag({class: 'net.nanopay.ui.FooterView'})
        .tag({ class: 'net.nanopay.ui.style.AppStyles'}) 
        .tag({ class: 'net.nanopay.invoice.ui.style.InvoiceStyles'})       
        .tag({ class: 'net.nanopay.ui.modal.ModalStyling'});  
    },

    function wrapCSS(text, id) {
      if ( text ) {
        if ( ! this.accentColor ) {
          var self = this;
          this.accentColor$.sub(function(s) {
            self.wrapCSS(text, id);
            s.detach();
          });
        }
        this.installCSS(text.
          replace(/%PRIMARYCOLOR%/g, this.primaryColor).
          replace(/%SECONDARYCOLOR%/g, this.secondaryColor).
          replace(/%TABLECOLOR%/g, this.tableColor).          
          replace(/%ACCENTCOLOR%/g, this.accentColor),
          id);
      }
    },

    function requestLogin(){
      var self = this;
      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset' ) {
        return;
      }

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'net.nanopay.auth.ui.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    }
  ]
});
