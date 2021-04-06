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
    'isMenuOpen',
    'menuListener',
    'loginSuccess'
  ],

  css: `
    ^ {
      position: absolute;
      top: 0;
      width: 100%;
    }

^ .foam-u2-view-TreeViewRow-label {
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
    }

    ^ .foam-u2-view-TreeViewRow {
      white-space: normal !important;
    }

    ^ .foam-nanos-menu-VerticalMenu .side-nav-view {
      margin-top: 56px;
    }

    ^ .imageMenuStyle {
      float: left;
      height: 30px;
      padding-top: 13px;
      padding-left: 1vw;
      background-color: /*%PRIMARY1%*/ #202341;
      cursor: pointer;
      border: none;
      outline: none;
    }

    ^ .openMenuStyle {
      margin-left: 4vw;
    }

    ^ .setTopMenu {
      height: 56px;
      margins: auto;
      z-index: 100001;
      background-color: /*%PRIMARY1%*/ #202341;
    }
  `,

  listeners: [
    function setViewDimensions(event) {
      var coll = document.getElementsByClassName('foam-u2-stack-StackView');
      var i;
      var value;
      for ( i = 0; i < coll.length; i++ ) {
        value = this.isMenuOpen ? 264 : 0;
        coll[i].style.paddingLeft = `${value}px`;
        coll[i].style.maxWidth = `${window.innerWidth - value}px`;
      }
    },
    function toggleMenu(event) {
      this.isMenuOpen = ! this.isMenuOpen;
    }
  ],
  methods: [
    function init() {
      this.isMenuOpen$.sub(this.setViewDimensions);
      this.setViewDimensions();
    },
    function initE() {
      window.onresize = this.setViewDimensions;
      var self = this;
      // Sets currentMenu and listeners on search selections and subMenu scroll on load.
      if ( window.location.hash != null ) this.menuListener(window.location.hash.replace('#', ''));

      this
      .show(this.loginSuccess$)
      .start()
        .addClass(this.myClass())
        .start()
          .addClass('setTopMenu')
          .start('img')
            .addClass('imageMenuStyle')
            .attr('src', '/images/menu/threeBars.svg')
            .attr('alt', 'toggle menu open')
        .on('click', function() { self.toggleMenu(); } )
          .end()
          .start()
            .show(this.isMenuOpen$)
            .tag({ class: 'foam.nanos.menu.VerticalMenu' })
          .end()
          .start()
            .addClass('openMenuStyle')
            .tag({ class: 'net.nanopay.ui.TopNavigation' })
          .end()
        .end()
      .end()
      ;
    }
  ]
});
