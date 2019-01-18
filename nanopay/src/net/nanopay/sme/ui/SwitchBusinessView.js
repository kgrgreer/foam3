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
    'net.nanopay.model.Business'
  ],

  imports: [
    'agent',
    'agentAuth',
    'businessDAO',
    'notify',
    'pushMenu',
    'stack',
    'user'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      background-color: #f9fbff;
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
    ^ .sme-business-row-item {
      width: 504px;
      height: 80px;
      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #e2e2e3;
      background-color: #ffffff;
      margin-bottom: 8px;
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
      margin-top: 56px;
      cursor: pointer;
      font-size: 16px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8e9090;
    }
    ^button-red {
      color: #f91c1c
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
      color: #2b2b2b;
      font-size: 16px;
      margin-left: 3px;
    }
    ^horizontal-flip {
      -moz-transform: scale(-1, 1);
      -webkit-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      transform: scale(-1, 1);
      margin-right: 10px;
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
    ^ .disabled .net-nanopay-sme-ui-BusinessRowView-oval {
      background-color: #e2e2e3 !important;
    }
  `,

  messages: [
    { name: 'BUSINESS_LOGIN_FAILED', message: 'Error trying to log into business.' },
    { name: 'CURRENTLY_SIGNED_IN', message: 'You are currently signed in as ' },
    { name: 'GO_BACK', message: 'Go back' },
    { name: 'SELECT_COMPANY', message: 'Select a company' },
    { name: 'DISABLED_BUSINESS_MSG', message: 'This business has been disabled. You cannot switch to it at this time.' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'enabledBusinesses_',
      documentation: `
        The DAO used to populate the enabled businesses in the list.
      `,
      expression: function(user, agent) {
        var party = this.agent || this.user;
        return this.PromisedDAO.create({
          promise: party.entities.junctionDAO$proxy
            .where(this.EQ(this.UserUserJunction.SOURCE_ID, party.id))
            .select()
            .then((sink) => {
              if ( sink == null ) throw new Error(`This shouldn't be null.`);
              return this.businessDAO
                .where(
                  this.AND(
                    this.EQ(this.Business.ENABLED, true),
                    this.NEQ(this.Business.STATUS, this.AccountStatus.DISABLED),
                    this.IN(this.Business.ID, sink.array.map((j) => j.targetId))
                  )
                )
                .select()
                .then((businessSink) => {
                  if ( businessSink == null ) throw new Error(`This shouldn't be null.`);
                  return party.entities.junctionDAO$proxy.where(
                    this.IN(this.UserUserJunction.TARGET_ID, businessSink.array.map((b) => b.id))
                  );
                });
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
        var party = this.agent || this.user;
        return this.PromisedDAO.create({
          promise: party.entities.junctionDAO$proxy
            .where(this.EQ(this.UserUserJunction.SOURCE_ID, party.id))
            .select()
            .then((sink) => {
              if ( sink == null ) throw new Error(`This shouldn't be null.`);
              return this.businessDAO
                .where(
                  this.AND(
                    this.EQ(this.Business.ENABLED, true),
                    this.EQ(this.Business.STATUS, this.AccountStatus.DISABLED),
                    this.IN(this.Business.ID, sink.array.map((j) => j.targetId))
                  )
                )
                .select()
                .then((businessSink) => {
                  if ( businessSink == null ) throw new Error(`This shouldn't be null.`);
                  return party.entities.junctionDAO$proxy.where(
                    this.IN(this.UserUserJunction.TARGET_ID, businessSink.array.map((b) => b.id))
                  );
                });
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
          business.group = junction.group;
          this.user = business;
          this.agent = result;
          this.pushMenu('sme.main.dashboard');
          return;
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
            this.assignBusinessAndLogIn(sink.array[0]);
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
          .on('click', () => {
            if ( this.stack.pos > 1 ) {
              this.stack.back();
              return;
            }
            this.pushMenu('sme.main.dashboard');
          })
          .start().addClass(this.myClass('button'))
            .start()
              .addClass(this.myClass('horizontal-flip'))
              .addClass(this.myClass('inline-block'))
              .add('➔')
            .end()
            .add(this.GO_BACK)
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
            .add(this.CURRENTLY_SIGNED_IN, ' ', this.user.businessName)
            .start('div').addClass(this.myClass('current-signin-email'))
              .add(this.user.email)
            .end()
          .end()
          .start()
            .select(this.enabledBusinesses_, function(junction) {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessRowView',
                  data: junction
                })
                  .addClass('sme-business-row-item')
                  .on('click', () => {
                    self.assignBusinessAndLogIn(junction);
                  })
                .end();
            })
            .select(this.disabledBusinesses_, function(junction) {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessRowView',
                  data: junction
                })
                  .addClass('sme-business-row-item')
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
              this.stack.push({ class: 'foam.nanos.auth.SignOutView' });
            })
          .end()
        .end()
      .end();
    }
  ]

});
