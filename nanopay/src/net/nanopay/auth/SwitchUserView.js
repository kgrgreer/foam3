/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'SwitchUserView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.AgentJunctionStatus'
  ],

  imports: [
    'agentAuth',
    'agentJunctionDAO',
    'crunchController',
    'ctrl',
    'initLayout',
    'isMenuOpen',
    'menuDAO',
    'notify',
    'pushMenu',
    'stack',
    'subject',
    'theme',
    'userDAO',
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
      overflow-y: auto
    }
    ^ h2 {
      font-weight: 700;
      font-size: 32px;
      line-height: 48px;
      margin-bottom: 0px;
    }
    ^side-block {
      display: inline-block;
      width: 200px;
      height: 100vh;
      vertical-align: top;
      text-align: center;
    }
    ^left-side-block {
      text-align: left;
    }
    ^right-side-block {
      text-align: right;
    }
    ^middle-block {
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
    ^ .comp-back {
      margin-left: 10vw;
    }
  `,

  messages: [
    { name: 'SWITCH_USER_FAILED', message: 'Error trying to switch user.' },
    { name: 'CURRENTLY_SIGNED_IN', message: 'You are currently signed in as ' },
    { name: 'CURRENTLY_ACTING_AS', message: ', acting as ' },
    { name: 'GO_BACK', message: 'Go back' },
    { name: 'SELECT_USER', message: 'Select a user' },
    { name: 'ERROR_DISABLED', message: 'Please contact an administrator to enable access' },
    { name: 'AGENT_SIGN_OUT', message: 'Agent sign out' },
    { name: 'ALREADY_ACTING_AS_USER', message: 'You are already acting as this user' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'junctionDAO_',
      factory: function() {
        let party = this.subject.realUser;
        if ( ! party ) party = this.subject.user;

        return party.entities.junctionDAO.where(
          this.EQ(this.UserUserJunction.SOURCE_ID, party.id)
        );
      }
    },
    'currentJunctionId'
  ],

  methods: [
    async function switchUserAndLogIn(junction) {
      var user = junction.targetUser;
      try {
        var result = await this.agentAuth.actAs(this, user);
        if ( result ) {
          await this.ctrl.fetchTheme();
          this.initLayout.resolve();
          this.pushDefaultMenu().then(function(menu) {
            if ( ! menu ) this.goBack();
          });
        }
      } catch (err) {
        var msg = err != null && typeof err.message === 'string'
          ? err.message
          : this.SWITCH_USER_FAILED;
        this.notify(msg, '', this.LogLevel.ERROR, true);
      }
    },

    async function pushDefaultMenu() {
      var defaultMenu = await this.menuDAO.find(this.theme.defaultMenu);
      if ( defaultMenu ) {
        this.purgeMenuDAO(defaultMenu);
        this.pushMenu(defaultMenu);
        this.isMenuOpen = true;
      }
      return defaultMenu;
    },

    function purgeMenuDAO(menu) {
      if ( ! menu || ! menu.handler ) return;
      var daoKey = '';
      if ( menu.handler.cls_ == foam.nanos.menu.DAOMenu2 ) {
        daoKey = menu.handler.config.daoKey;
      } else if ( menu.handler.cls_ == foam.nanos.menu.DAOMenu ) {
        daoKey = menu.handler.daoKey;
      } else {
        return;
      }

      this.__subContext__[daoKey].cmd_(this, foam.dao.TTLSelectCachingDAO.PURGE);
      this.__subContext__[daoKey].cmd_(this, foam.dao.AbstractDAO.RESET_CMD);
    },

    async function initE() {
      var self = this;
      var agent = this.subject.realUser;
      var entity = this.subject.user;
      var actingAsUser = agent && entity && agent.id !== entity.id;
      var junction = await this.junctionDAO_.find(
        this.EQ(this.UserUserJunction.TARGET_ID, entity.id));
      this.currentJunctionId = junction && junction.id;

      // Go back
      this.start().addClass(this.myClass())
        .start().show(this.subject.realUser$.map(function(agent) {
          return agent;
        }))
          .addClass(this.myClass('side-block'))
          .addClass(this.myClass('left-side-block'))
          .start().addClass(this.myClass('button'))
            .tag({
              class: 'foam.u2.tag.Image',
              data: 'images/back-icon.svg'
              })
            .start()
              .addClass(this.myClass('back-text'))
              .add(this.GO_BACK)
            .end()
            .on('click', this.goBack)
          .end()
        .end()

        // Current user and realUser
        .start().addClass(this.myClass('middle-block'))
          .enableClass('comp-back', this.subject.realUser$.map(function(agent) {
            return ! agent;
          }))
          .start('h2').addClass(this.myClass('header'))
            .add(this.SELECT_USER)
          .end()

          .start('div').addClass(this.myClass('current-signin'))
            .add(this.CURRENTLY_SIGNED_IN)
            .start('div').addClass(this.myClass('current-signin-email'))
              .add(this.slot(function(subject) {
                return subject.realUser ? subject.realUser.toSummary() : subject.user.toSummary();
              }))
            .end()
            .callIf(actingAsUser, function() {
              this
                .add(self.CURRENTLY_ACTING_AS)
                .start('div').addClass(self.myClass('current-signin-email'))
                  .add(self.subject.user.toSummary())
                .end()
            })
          .end()

          // Agent junction list
          .start()
            .select(this.junctionDAO_$proxy, function(junction) {
              var isActive = junction.id.equals(self.currentJunctionId);
              return this.E()
                .start({
                  class: 'net.nanopay.auth.SwitchUserRowView',
                  data: junction,
                  currentlyActive: isActive
                })
                  .on('click', () => {
                    if ( isActive ) return;
                    if ( junction.status === self.AgentJunctionStatus.DISABLED ) {
                      return;
                    }
                    self.switchUserAndLogIn(junction);
                  })
                .end();
            })
          .end()
        .end()

        // Agent sign out
        .start().show(this.currentJunctionId)
          .addClass(this.myClass('right-side-block'))
          .addClass(this.myClass('side-block'))
          .start().addClass(this.myClass('button'))
            .addClass(this.myClass('button-red'))
            .add(self.AGENT_SIGN_OUT)
            .on('click', () => {
              this.agentAuth.logout().then(function() {
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
      this.pushDefaultMenu();
    }
  ]
});
