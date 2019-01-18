foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AccountProfileView',
  extends: 'foam.u2.View',

  documentation: 'Account profile view',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'agent',
    'auth',
    'businessDAO',
    'menuDAO',
    'notify',
    'pushMenu',
    'user',
    'window'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.menu.Menu',
    'net.nanopay.model.Business'
  ],

  css: `
    {
      margin-left: 200px;
      background: white;
    }
    ^ .account-profile-menu {
      width: 252px !important;
      background-color: white;
      padding: 12px 0px;
      position: absolute;
      z-index: 900;
      margin-left: 28px;
      margin-top: 8px;
      border-radius: 3px;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
    }
    ^ .account-profile-menu::before {
      width: 0; 
      height: 0; 
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent; 
      border-right:10px solid blue; 
      z-index: 999;
    }
    ^ .account-profile-item {
      padding: 8px 24px;
      font-size: 16px;
      line-height: 24px;
    }
    ^ .account-profile-item:hover {
      background: #f3f2ff;
      color: #604aff;
      cursor:pointer;
    }
    ^ .account-profile-items-detail {
      font-size: 10px;
      line-height: 15px;
      color: #8e9090;
      margin-bottom: 0px;
      margin-top: 1px;
    }
    ^ .sign-out {
      margin-left: 5px;
    }
    ^background {
      bottom: 0;
      left: 0;
      opacity: 0.4;
      right: 0;
      top: 0;
      position: fixed;
      z-index: 850;
    }
    ^ .red {
      color: #d60f0f;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      documentation: `JunctionDAO indicating who the current user or agent can act as.`,
      expression: function(agent) {
        return this.PromisedDAO.create({
          promise: agent.entities.junctionDAO$proxy
            .where(this.EQ(this.UserUserJunction.SOURCE_ID, agent.id))
            .select()
            .then((sink) => {
              if ( sink == null ) throw new Error(`This shouldn't be null.`);
              return this.businessDAO
                .where(
                  this.AND(
                    this.EQ(this.Business.ENABLED, true),
                    this.IN(this.Business.ID, sink.array.map((j) => j.targetId))
                  )
                )
                .select()
                .then((businessSink) => {
                  if ( businessSink == null ) throw new Error(`This shouldn't be null.`);
                  return agent.entities.junctionDAO$proxy.where(
                    this.IN(this.UserUserJunction.TARGET_ID, businessSink.array.map((b) => b.id))
                  );
                });
            })
        });
      }
    }
  ],

  messages: [
    { name: 'ONE_BUSINESS_MSG', message: `You're part of only one business.` }
  ],

  methods: [
    function initE() {
      var dao = this.menuDAO.orderBy(this.Menu.ORDER)
          .where(this.STARTS_WITH(this.Menu.ID, 'sme.accountProfile'));

      var self = this;
      this.addClass(this.myClass())
        .start().addClass('account-profile-menu')
          .select(dao, function(menu) {
            if ( menu.id === 'sme.accountProfile.switch-business' ) {
              return this.E().addClass('account-profile-item')
                  .start('a').addClass('sme-noselect')
                    .add(menu.label)
                  .end()
                  .on('click', function() {
                    self.dao_
                      .select()
                      .then((sink) => {
                        if ( sink.array.length === 1 ) {
                          self.notify(self.ONE_BUSINESS_MSG, 'error');
                        } else {
                          self.pushMenu(menu.id);
                        }
                        self.remove();
                      });
                  });
            }

            if ( menu.id === 'sme.accountProfile.signout' ) {
              return this.E()
                .addClass('account-profile-item')
                .addClass('red')
                .start('a')
                  .addClass('sme-noselect')
                  .add(menu.label)
                .end()
                .on('click', function() {
                  self.remove();
                  self.auth.logout().then(function() {
                    self.window.location.assign(self.window.location.origin);
                  });
                });
            }

            return this.E().addClass('account-profile-item')
                .start('a').addClass('sme-noselect')
                  .add(menu.label)
                  .start('p').addClass('account-profile-items-detail')
                    .add(menu.description)
                  .end()
                .end()
                .on('click', function() {
                  self.remove();
                  self.pushMenu(menu.id);
                });
          })
        .end()
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.close)
        .end()
      .end();
    }
  ],

  listeners: [
    function close() {
      this.remove();
    }
  ]
});
