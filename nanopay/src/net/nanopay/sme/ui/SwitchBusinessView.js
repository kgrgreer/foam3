foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SwitchBusinessView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.UserUserJunction',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.AgentJunctionStatus',
    'net.nanopay.model.Business'
  ],

  imports: [
    'agent',
    'agentAuth',
    'auth',
    'businessDAO',
    'ctrl',
    'notify',
    'pushMenu',
    'stack',
    'user',
    'window'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      background-color: /*%GREY5%*/ #f5f7fa;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      text-align: center;
      overflow-y: scroll
    }
    ^ h2 {
      font-weight: 700;
      font-size: 32px;
      line-height: 48px;
      margin-bottom: 0px;
    }
    ^sme-business-choice {
      width: 500px;
    }
    ^sme-side-block {
      display: inline-block;
      width: 200px;
      height: 100vh;
      vertical-align: top;
      text-align: center;
    }
    ^sme-left-side-block {
      text-align: left;
    }
    ^sme-right-side-block {
      text-align: right;
    }
    ^sme-middle-block {
      display: inline-block;
      width: 504px;
      height: 100vh;
      text-align: left;
    }
    ^button {
      color: #8e9090;
      cursor: pointer;
      display: inline-flex;
      font-size: 16px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      line-height: 1.5;
      margin-top: 56px;
    }
    ^button-red {
      color: #f91c1c
    }
    ^back-text {
      display: inline-block;
      margin-left: 12px;
    }
    ^header {
      margin-top: 45px;
    }
    ^current-signin {
      display: inline-block;
      color: #8e9090;
      margin-bottom: 24px;
      font-size: 16px;
      line-height: 24px;
    }
    ^current-signin-email {
      display: inline-block;
      color: /*%BLACK%*/ #1e1f21;
      font-size: 16px;
      margin-left: 3px;
    }
    ^inline-block {
      display: inline-block;
    }
    ^ .comp-back {
      margin-left: 10vw;
    }
    ^ .disabled {
      filter: grayscale(100%) opacity(60%);
    }
    ^ .disabled .net-nanopay-sme-ui-BusinessJunctionRowView-oval {
      background-color: #e2e2e3 !important;
    }
  `,

  messages: [
    { name: 'BUSINESS_LOGIN_FAILED', message: 'Error trying to log into business.' },
    { name: 'CURRENTLY_SIGNED_IN', message: 'You are currently signed in as ' },
    { name: 'GO_BACK', message: 'Go back' },
    { name: 'SELECT_COMPANY', message: 'Select a company' },
    { name: 'DISABLED_BUSINESS_MSG', message: 'This business has been disabled. You cannot switch to it at this time.' },
    { name: 'ERROR_DISABLED', message: 'Please contact an administrator for this company to enable access.' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'enabledBusinesses_',
      documentation: `
        The DAO used to populate the enabled businesses in the list.
      `,
      expression: function(user, agent) {
        var party = agent || user;
        return this.PromisedDAO.create({
          promise: party.entities.dao
            .where(this.NEQ(this.Business.STATUS, this.AccountStatus.DISABLED))
            .select(this.MAP(this.Business.ID))
            .then((mapSink) => {
              return party.entities.junctionDAO.where(
                this.AND(
                  this.EQ(this.UserUserJunction.SOURCE_ID, party.id),
                  this.IN(this.UserUserJunction.TARGET_ID, mapSink.delegate.array)
                )
              );
            })
        });
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'disabledBusinesses_',
      documentation: `
        The DAO used to populate the disabled businesses in the list.
      `,
      expression: function(user, agent) {
        var party = agent || user;
        return this.PromisedDAO.create({
          promise: party.entities.dao
            .where(this.EQ(this.Business.STATUS, this.AccountStatus.DISABLED))
            .select(this.MAP(this.Business.ID))
            .then((mapSink) => {
              return party.entities.junctionDAO.where(
                this.AND(
                  this.EQ(this.UserUserJunction.SOURCE_ID, party.id),
                  this.IN(this.UserUserJunction.TARGET_ID, mapSink.delegate.array)
                )
              );
            })
        });
      }
    }
  ],

  methods: [
    /**
     * Act as the Business referenced by the given Junction and go to the
     * dashboard.
     * @param {*} junction The junction between the User and the Business they
     * want to switch to.
     */
    async function assignBusinessAndLogIn(junction) {
      var business = await this.businessDAO.find(junction.targetId);
      try {
        var result = await this.agentAuth.actAs(this, business);
        if ( result ) {
          await this.ctrl.fetchGroup();
          this.user = business;
          this.agent = result;
          this.pushMenu('sme.main.dashboard');
          return;
        } else {
          throw new Error();
        }
      } catch (err) {
        var msg = err != null && typeof err.message === 'string'
          ? err.message
          : this.BUSINESS_LOGIN_FAILED;
        this.notify(msg, 'error');
      }
    },

    function init() {
      this.enabledBusinesses_
        .select()
        .then((sink) => {
          if ( sink.array.length === 1 ) {
            var junction = sink.array[0];

            // If the user is only in one business but that business has
            // disabled them, then don't immediately switch to that business.
            if ( junction.status === this.AgentJunctionStatus.DISABLED ) return;

            this.assignBusinessAndLogIn(junction);
            this.removeAllChildren();
          }
        });
    },

    function initE() {
      var self = this;
      this.start().addClass(this.myClass())
        .start().show(this.agent$.map(function(agent) {
          return agent;
        }))
          .addClass(this.myClass('sme-side-block'))
          .addClass(this.myClass('sme-left-side-block'))
          .start().addClass(this.myClass('button'))
            .tag({
              class: 'foam.u2.tag.Image',
              data: 'images/ablii/gobackarrow-grey.svg'
              })
            .start()
              .addClass(this.myClass('back-text'))
              .add(this.GO_BACK)
            .end()
            .on('click', this.goBack)
          .end()
        .end()

        .start().addClass(this.myClass('sme-middle-block'))
          .enableClass('comp-back', this.agent$.map(function(agent) {
            return ! agent;
          }))
          .start('h2').addClass(this.myClass('header'))
            .add(this.SELECT_COMPANY)
          .end()

          .start('div').addClass(this.myClass('current-signin'))
            .add(this.CURRENTLY_SIGNED_IN)
            .start('div').addClass(this.myClass('current-signin-email'))
              .add(this.slot(function(agent, user) {
                return agent != null ? agent.email : user.email;
              }))
            .end()
          .end()
          .start()
            .select(this.enabledBusinesses_, function(junction) {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessJunctionRowView',
                  data: junction
                })
                  .on('click', () => {
                    if ( junction.status === self.AgentJunctionStatus.DISABLED ) {
                      self.ctrl.notify(self.ERROR_DISABLED, 'error');
                    }
                    self.assignBusinessAndLogIn(junction);
                  })
                .end();
            })
          .end()
          .start()
            .select(this.disabledBusinesses_, function(junction) {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessJunctionRowView',
                  data: junction
                })
                  .addClass('disabled')
                  .on('click', () => {
                    self.notify(self.DISABLED_BUSINESS_MSG, 'error');
                  })
                .end();
            })
          .end()
        .end()

        .start().addClass(this.myClass('sme-right-side-block'))
          .addClass(this.myClass('sme-side-block'))
          .start().addClass(this.myClass('button'))
            .addClass(this.myClass('button-red'))
            .add('Sign out')
            .on('click', () => {
              this.auth.logout().then(function() {
                self.window.location.assign(self.window.location.origin);
              });
            })
          .end()
        .end()
      .end();
    }
  ],

  listeners: [
    function goBack() {
      if ( this.stack.pos > 1 ) {
        this.stack.back();
        return;
      }
      this.pushMenu('sme.main.dashboard');
    }
  ]
});
