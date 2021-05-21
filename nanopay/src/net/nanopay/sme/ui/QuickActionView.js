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
  name: 'QuickActionView',
  extends: 'foam.u2.View',

  documentation: 'Quick action view',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'menuDAO',
    'pushMenu',
    'loginSuccess'
  ],

  requires: [
    'foam.nanos.menu.Menu',
  ],

  css: `
    ^ .menu-item {
      margin: 8px;
    }
    ^ .icon {
      display: inline-block;
      height: 18px;
      width: 18px;
      margin-left: 16px;
      margin-top: 8px;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      expression: function(loginSuccess){
        return this.menuDAO
          .where(this.STARTS_WITH(this.Menu.ID, 'sme.quickAction'));
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .start()
          .addClass('quick-actions')
          .select(this.dao$proxy, function(menu) {
            return this.E()
              .addClass('sme-quick-action-wrapper')
              .call(function() {
                this
                  .start()
                    .addClass((menu.label).replace(/[^\w]/g,'').toLowerCase())
                    .start('img')
                      .addClass('icon')
                      .attr('src', menu.icon)
                    .end()
                    .start('a')
                      .addClass('menu-item')
                      .addClass('sme-noselect')
                      .add(menu.label)
                    .end()
                    .on('click', () => {
                      self.quickActionRedirect(menu);
                    })
                  .end();
              });
          })
        .end();
    }
  ],

  listeners: [
    function quickActionRedirect(menu) {
      var checkAndNotifyAbility;

      var checkAndNotifyAbility = menu.id === 'sme.quickAction.send' ?
        this.checkAndNotifyAbilityToPay :
        this.checkAndNotifyAbilityToReceive;

      checkAndNotifyAbility().then((result) => {
        if ( result ) {
          this.pushMenu(menu.id);
        }
      });
    }
  ]
});
