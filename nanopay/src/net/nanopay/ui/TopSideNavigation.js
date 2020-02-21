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
