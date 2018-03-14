foam.CLASS({
  package: 'net.nanopay.interac.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',

  implements: [
    'foam.box.Context',
    'foam.mlang.Expressions',
    'net.nanopay.interac.dao.Storage',
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.nanos.client.ClientBuilder',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.interac.Data',
    'net.nanopay.interac.Iso20022',
    'net.nanopay.iso20022.ISO20022Driver',
    'net.nanopay.model.Account',
  ],

  exports: [
    'stack',
    'user',
    'country',
    'account',
    'as ctrl'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .stack-wrapper{
          min-height: calc(80% - 60px);
          margin-bottom: -10px;
        }
        .stack-wrapper:after{
          content: "";
          display: block;
        }
        .stack-wrapper:after, .net-nanopay-interac-ui-shared-FooterView{
          height: 10px;
        }
        .foam-u2-ActionView-payNow {
          width: 80px;
          height: 30px;
          border: none !important;
          background: #59a5d5 !important;
          font-size: 10px !important;
          color: white !important;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'clientPromise',
      factory: function() {
        var self = this;
        return self.ClientBuilder.create().promise.then(function(cls) {
          var c = cls.create(null, self);
          self.clientContext = c.__subContext__;
          return c;
        });
      },
    },
    {
      name: 'clientContext',
      postSet: function(_, n) { this.__subSubContext__ = n },
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function() { return this.User.create(null, this.clientContext); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.model.Account',
      name: 'account',
      factory: function() { return this.Account.create(null, this.clientContext); }
    },
    {
      name: 'stack',
      factory: function () {
        return this.Stack.create(null, this.clientContext);
      }
    },
    {
      name: 'iso20022',
      factory: function () {
        return this.Iso20022.create(null, this.clientContext);
      }
    },
    {
      name: 'iso20022Driver',
      factory: function () {
        return this.ISO20022Driver.create(null, this.clientContext);
      }
    },
    {
      class: 'String',
      name: 'country'
    }
  ],

  methods: [
    function init () {
      this.SUPER();
      var self = this;
      self.clientPromise.then(function() {
        // Injecting Sample Partner
        // self.clientContext.userDAO.limit(1).select().then(function(a) {
        //   self.user.copyFrom(a.array[0]);
        // });
      })
    },

    function initE() {
      var self = this;
      self.clientPromise.then(function() {
        self.Data.create(null, self.clientContext);

        if(self.country == 'Canada') {
          self.stack.push({ class: 'net.nanopay.interac.ui.CanadaTransactionsView' });
        } else if(self.country == 'India') {
          self.stack.push({ class: 'net.nanopay.interac.ui.IndiaTransactionsView' });
        }

        self
          .addClass(self.myClass());
          /*.add(self.user$.dot('id').map(function (id) {
            return id ?
              self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.TopNav', data: self.business }) :
              self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.NoMenuTopNav' });
          }))*/

          if(self.country == 'Canada') {
            self.add(self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.CanadaTopNav'}));
            self.clientContext.userDAO.find(1).then(function(a) {
              self.user.copyFrom(a);
              self.accountDAO.find(self.user.id).then(function(a){
                self.account = a;
              })
            });
            self.stack.push({ class: 'net.nanopay.interac.ui.CanadaTransactionsView' });
          } else if(self.country == 'India') {
            self.add(self.E().tag({class: 'net.nanopay.interac.ui.shared.topNavigation.IndiaTopNav', data: self.business}));
            self.clientContext.userDAO.find(2).then(function(a) {
              self.user.copyFrom(a);
              self.accountDAO.find(self.user.id).then(function(a){
                self.account = a;
              })
            });
            self.stack.push({ class: 'net.nanopay.interac.ui.IndiaTransactionsView' });
          }

          self.br()
          .start('div').addClass('stack-wrapper')
            .tag({ class: 'foam.u2.stack.StackView', data: self.stack, showActions: false })
          .end()
          .br()
          .tag({class: 'net.nanopay.interac.ui.shared.FooterView'})
      });
    }
  ]

});
