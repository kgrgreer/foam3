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
  package: 'net.nanopay.ui',
  name: 'TopSideNavigation',
  extends: 'foam.u2.Controller',

  documentation: `
    Top and side navigation menu bars. Side navigation bar displays menu items
    available to user and a menu search which navigates to menu after selection.
    Top navigation bar displays application and user related information along
    with personal settings menus.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.menu.VerticalMenu'
  ],

  imports: [
    'menuListener',
    'loginSuccess',
  ],

  css: `
    ^ .foam-u2-view-TreeViewRow-label {
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
    }

    ^ .foam-u2-view-TreeViewRow {
      white-space: normal !important;
    }
  `,

  methods: [
      function initE() {
        var self = this;
        // Sets currentMenu and listeners on search selections and subMenu scroll on load.
        if ( window.location.hash != null ) this.menuListener(window.location.hash.replace('#', ''));

        this
        .show(this.loginSuccess$)
        .start()
          .addClass(this.myClass())
          .tag({ class: 'net.nanopay.ui.TopNavigation' })
          .tag({ class: 'foam.nanos.menu.VerticalMenu' })
        .end();
        
      }
  ]
});
