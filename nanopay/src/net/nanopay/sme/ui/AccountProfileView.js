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
  name: 'AccountProfileView',
  extends: 'foam.u2.View',

  documentation: 'Account profile view',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
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
    ^ .red:hover {
      color: #d60f0f;
      background: #fff6f6;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      documentation: `JunctionDAO indicating who the current user or agent can act as.`,
      expression: function(agent) {
        return agent.entities.junctionDAO.where(this.EQ(this.UserUserJunction.SOURCE_ID, agent.id));
      }
    }
  ],

  messages: [
    { name: 'ONE_BUSINESS_MSG', message: `You're part of only one business` }
  ],

  methods: [
    function initE() {
      var dao = this.menuDAO
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
                    self.pushMenu(menu.id);
                    self.close();
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
