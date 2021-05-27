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
  package: 'net.nanopay.sme.ui',
  name: 'SwitchBusinessView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'foam.core.Latch',
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'net.nanopay.admin.model.AccountStatus',
    'foam.nanos.auth.AgentJunctionStatus',
    'net.nanopay.model.Business'
  ],

  imports: [
    'subject',
    'agentAuth',
    'assignBusinessAndLogIn',
    'auth',
    'businessDAO',
    'capabilityDAO',
    'crunchController',
    'crunchService',
    'ctrl',
    'initLayout',
    'isMenuOpen',
    'menuDAO',
    'notify',
    'onboardingUtil',
    'pushDefaultMenu',
    'pushMenu',
    'stack',
    'theme',
    'userCapabilityJunctionDAO',
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
      overflow-y: auto
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
    ^ .foam-u2-ActionView-createBusiness {
      background: none;
      border: none;
      color: cornflowerblue;
      font-style: italic;
      margin-top: 10px;
    }
    ^ .foam-u2-ActionView-createBusiness:hover:not(:disabled) {
      background: none;
      border: none;
      color: grey;
    }
  `,

  messages: [
    { name: 'BUSINESS_LOGIN_FAILED', message: 'Error trying to log into business.' },
    { name: 'CURRENTLY_SIGNED_IN', message: 'You are currently signed in as ' },
    { name: 'GO_BACK', message: 'Go back' },
    { name: 'SELECT_COMPANY', message: 'Select a company' },
    { name: 'DISABLED_BUSINESS_MSG', message: 'This business has been disabled. You cannot switch to it at this time.' },
    { name: 'ERROR_DISABLED', message: 'Please contact an administrator for this company to enable access' },
    { name: 'SIGN_OUT', message: 'Sign out' },
  ],

  properties: [
    ['updated', false],
    net.nanopay.ui.Controller.ENABLED_BUSINESSES_.clone(),
    {
      class: 'foam.dao.DAOProperty',
      name: 'disabledBusinesses_',
      documentation: `
        The DAO used to populate the disabled businesses in the list.
      `,
      expression: function(subject, updated) {
        var agent = subject.realUser;
        var user = subject.user;
        var party = agent.created ? agent : user;
        return this.PromisedDAO.create({
          promise: party.entities.dao
            .where(this.EQ(this.Business.STATUS, this.AccountStatus.DISABLED))
            .select(this.MAP(this.Business.ID))
            .then(mapSink => {
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
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.Latch',
      name: 'loadingComplete',
      documentation: 'Loading latch.',
      factory: function() {
        return this.Latch.create();
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

    async function init() {
      if ( this.user.cls_ != net.nanopay.model.Business ) {
        let sink = await this.enabledBusinesses_.select();
        var ac = this.theme.admissionCapability;
        if ( ac ) {
          var ucj = await this.crunchService.getJunction(null, ac);
          if ( ucj.status !==  this.CapabilityJunctionStatus.GRANTED ) {
            this.onboardingUtil.initUserRegistration(ac);
            return;
          }
        }

        if ( sink.array.length === 0 ) {
          this.initLayout.resolve();
          await this.pushDefaultMenu();
          return;
        }

        if ( sink.array.length === 1 ) {
          this.initLayout.resolve();
          var junction = sink.array[0];

          // If the user is only in one business but that business has
          // disabled them, then don't immediately switch to that business.
          if ( junction.status === this.AgentJunctionStatus.DISABLED ) return;
          await this.assignBusinessAndLogIn(junction);
          this.removeAllChildren();
          return;
        }
      }
      this.loadingComplete.resolve();
    },

    async function initE() {
      await this.loadingComplete;
      var self = this;

      this.start().addClass(this.myClass())
        .start().show(this.subject.realUser$.map(function(agent) {
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
          .enableClass('comp-back', this.subject.realUser$.map(function(agent) {
            return ! agent;
          }))
          .start('h2').addClass(this.myClass('header'))
            .add(this.SELECT_COMPANY)
          .end()

          .start('div').addClass(this.myClass('current-signin'))
            .add(this.CURRENTLY_SIGNED_IN)
            .start('div').addClass(this.myClass('current-signin-email'))
              .add(this.slot(function(user) {
                return user.toSummary();
              }))
            .end()
          .end()
          .start()
            .select(this.enabledBusinesses_$proxy, function(junction) {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessJunctionRowView',
                  data: junction
                })
                  .on('click', () => {
                    if ( junction.status === self.AgentJunctionStatus.DISABLED ) {
                      self.ctrl.notify(self.ERROR_DISABLED, '', self.LogLevel.ERROR, true);
                    }
                    self.assignBusinessAndLogIn(junction);
                  })
                .end();
            })
          .end()
          .start()
            .select(this.disabledBusinesses_$proxy, function(junction) {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessJunctionRowView',
                  data: junction
                })
                  .addClass('disabled')
                  .on('click', () => {
                    self.notify(self.DISABLED_BUSINESS_MSG, '', self.LogLevel.ERROR, true);
                  })
                .end();
            })
          .end()
          .startContext({ data: this })
            .start(this.CREATE_BUSINESS).end()
          .endContext()
        .end()

        .start().addClass(this.myClass('sme-right-side-block'))
          .addClass(this.myClass('sme-side-block'))
          .start().addClass(this.myClass('button'))
            .addClass(this.myClass('button-red'))
            .add(self.SIGN_OUT)
            .on('click', () => {
              this.auth.logout().then(function() {
                self.window.location.assign(self.window.location.origin);
              });
            })
          .end()
        .end()
      .end();
    },
    function clearCachedDAOs() {
      this.menuDAO.cmd_(this, foam.dao.CachingDAO.PURGE);
      this.menuDAO.cmd_(this, foam.dao.AbstractDAO.RESET_CMD);
      this.crunchController.purgeCachedCapabilityDAOs();
    }
  ],

  listeners: [
    function goBack() {
      if ( this.stack.pos > 1 ) {
        this.stack.back();
        return;
      }
      this.pushMenu('sme.main.appStore');
    }
  ],
  actions: [
    {
      name: 'createBusiness',
      label: 'Click here to create a new business...',
      code: function(X) {
        this.add(this.Popup.create(null, X).tag({
          class: 'net.nanopay.sme.ui.CreateBusinessModal',
          updated$: this.updated$
        }));
      }
    }
  ]
});
