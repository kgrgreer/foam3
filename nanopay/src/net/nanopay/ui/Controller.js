foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',
  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },
  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [
    'foam.nanos.client.Client',
    'foam.mlang.Expressions',
    'net.nanopay.util.CurrencyFormatter',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.invoice.ui.style.InvoiceStyles',
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'net.nanopay.model.Currency',
    'net.nanopay.model.Account',
    'foam.dao.EasyDAO',
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  exports: [
    'account',
    'stack',
    'as ctrl',
    'user',
    'requestLogin'
  ],

  imports: [
    'sessionSuccess'
  ],

  css: `
    .stack-wrapper{
      min-height: calc(80% - 60px);
      margin-bottom: -10px;
    }
    .stack-wrapper:after{
      content: "";
      display: block;
    }
    .stack-wrapper:after, .net-nanopay-b2b-ui-shared-FooterView{
      height: 10px;
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
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var self = this;
      foam.__context__.register(net.nanopay.ui.ActionView, 'foam.u2.ActionView');

      /*******   Loads User for Testing Purposes (comment out if not needed)  ********/
      this.userDAO.select().then(function(a) {
        self.user.copyFrom(a.array[0]);
      });

      /*******   Loads Account with balance for Testing Purposes (comment out if not needed)  ********/
      this.accountDAO.select().then(function(a) {
        self.account.copyFrom(a.array[0]);
      });
      window.onpopstate = function(event) {
        if (location.hash != null) {
          var hid= location.hash.substr(1);
          console.log(hid);
          
          self.menuDAO.find(hid).then(function(menu){          
            menu.launch(this,null);
         })
        }
      }
      net.nanopay.TempMenu.create(null, this);
      if (location.hash != null) {
        var hid= location.hash.substr(1);
        console.log(hid);
        
        self.menuDAO.find(hid).then(function(menu){          
          menu.launch(this,null);
       })
      }
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
        .tag({class: 'net.nanopay.ui.FooterView'});
    },

    function requestLogin(){
      var self = this;

      return new Promise(function(resolve, reject){
        self.stack.push({ class: 'net.nanopay.auth.ui.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    }
  ]
});
