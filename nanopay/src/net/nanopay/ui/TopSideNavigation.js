foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TopSideNavigation',
  extends: 'foam.u2.Controller',

  documentation: 'Navigation bars',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.MenuBar',
    'foam.nanos.u2.navigation.BusinessLogoView',
    'foam.nanos.u2.navigation.UserView'
  ],

  imports: [
    'currentMenu',
    'menuListener',
    'group',
    'loginSuccess',
    'menuDAO',
    'pushMenu',
    'stack',
    'user'
  ],

  css: `
    ^ .top-nav {
      width: 100%;
      display: flex;
      z-index: 10001;
      position: fixed;
      background-color: #202341;
      height: 60px;
      font-family: Roboto, Helvetica, sans-serif;
    }
    .sidenav-item-wrapper {
      vertical-align: middle;
      cursor: pointer;
      max-height: 170px;
      width: 100%;
    }
    .menu-label:hover { 
      width: 100%;
      border-left: 4px solid #406dea !important;
      background: rgba(64, 109, 234, 0.1);
      color: black;
    }
    ^ .user-view {
      margin: 0 !important;
      display: flex;
    }
    .net-nanopay-ui-MenuNavigationView {
      background-color: #202341;
    }
    .foam-comics-DAOControllerView {
      width: -webkit-max-content;
      margin: 24px auto 0 auto;
    }
    ^ .radio-as-arrow-margins {
      float: right;
      margin-top: -12px;
    }
    ^ .account-button {
      border-radius: 3px;
      margin: 10px 0 16px 20px;
      padding: 8px 6px 8px 4px;
    }
    ^ .account-button:hover {
      cursor: pointer;
      background: #f2f2f2;
    }
    ^ .account-button-info-block {
      display: inline-block;
      vertical-align: middle;
      width: 100px;
      margin-left: 4px;
    }
    ^ .side-nav-view {
      color: rgba(30, 31, 33, 0.5);
      border-right: 1px solid #e2e2e3;
      height: 90vh;
      display: inline-block;
      width: 240px;
      position: fixed;
      padding-top: 100px;
      font-size: 26px;
      overflow-y: scroll;
      overflow-x: hidden;
    }
    ^ .selected-sub {
      color: #604aff;
      font-weight: 600;
    }
    ^ .submenu-item-wrapper {
      margin-left: 20px;
      display: inline-block;
      vertical-align: middle;
      font-family: Roboto, Helvetica, sans-serif;
    }
    ^ .submenu-item-wrapper:hover {
      font-weight: bold;
    }
    ^ .submenu {
      max-height: 120px;
      font-size: 14px;
      overflow-y: scroll;
    }
    ^ .icon {
      width: 16px;
      height: 16px;
      padding-right: 10px;
      vertical-align: top;
    }
    ^ .up-arrow {
      margin-bottom: 6px;
      border: 1px solid #406dea;
      display: inline-block;
      padding: 3px;
      float: right;
      position: relative;
      right: 40px;
      top: 7px;
      transform: rotate(45deg);
      border-width: 1px 0px 0px 1px;
      -webkit-transform: rotate(45deg);
    }
    ^ .menu-label {
      width: calc(100% - 24px);
      padding-top: 15px;
      padding-left: 20px;
      height: 30px;
      font-size: 14px;
      vertical-align: top;
      display: inline-block;
      border-left: 4px solid /*%GREY5%*/;
    }
    ^ .menu-label span {
      display: inline-block;
    }
    ^ .menu-label:hover {
      color: black;
    }
    ^ .sub-menu-item { 
      width: 100%;
      padding: 5px 0px 5px 50px;
    }
    ^ .selected-root {
      width: 100%;
      border-left: 4px solid #406dea !important;
      background: rgba(64, 109, 234, 0.1);
      color: black;
    }
    ^ .dot > span {
      color: white;
    }
    ^ .dot > span:active {
      background: none;
    }
    ^ .navigation-components {
      margin-right: 40px;
      display: flex;
      align-items: center;
    }
    ^ .foam-nanos-u2-navigation-ApplicationLogoView {
      margin-left: 40px;
      display: flex;
      flex-grow: 1;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-currencyChoice,
    ^ .net-nanopay-sme-ui-AbliiActionView-currencyChoice:hover
    {
      background: none !important;
      border: none !important;
    }
    ^ .foam-nanos-u2-navigation-NotificationMenuItem img {
      margin-top: 10px;
    }
    ^ .foam-nanos-u2-navigation-ApplicationLogoView {
      margin-left: 40px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner div {
      right: 100px;
      position: relative;
    }
    ^ .foam-nanos-menu-SubMenuView-inner {
      z-index: 10001;
      box-shadow: none;
      position: absolute;
      top: 60px;
      font-weight: 300;
      right: -100px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div {
      height: 40px;
      padding-left: 50px;
      font-size: 14px;
      font-weight: 300;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 25px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:last-child {
      background-color: #f6f9f9;
      box-shadow: 0 -1px 0 0 #e9e9e9;
      font-size: 14px;
      color: #c82e2e;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:hover {
      background-color: /*%GREY5%*/ #406dea;
      cursor: pointer;
    }
    ^ .foam-nanos-menu-SubMenuView-inner::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border-bottom-color: white;
      -ms-transform: translate(110px, -16px);
      transform: translate(110px, -16px);
    }
    ^ .foam-nanos-menu-SubMenuView-background {
      width: 100vw;
      height: 100vh;
    }
  `,

  properties: [
    {
      name: 'menuName',
      value: '' // The root menu
    },
    'menu',
    'parent',
    {
      name: 'menuSearch',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Menus',
              dao: X.menuDAO
            },
          ],
          search: true,
          searchPlaceholder: 'Search...'
        };
      }
    }
  ],

  methods: [
      function initE() {
        var self = this;
        var dao_ = this.menuDAO.orderBy(this.Menu.ORDER);
        if ( window.location.hash != null ) this.menuListener(window.location.hash.replace('#', ''));
        this.menuSearch = this.currentMenu;
        this.menuSearch$.sub(this.updateView);

        this.start().addClass(this.myClass())
          .show(this.loginSuccess$)
          .start().addClass('side-nav-view')
            .tag(this.MENU_SEARCH)
            .select(this.menuDAO.orderBy(this.Menu.ORDER).where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
              var slot = foam.core.SimpleSlot.create({ value: false });
              var hasChildren = foam.core.SimpleSlot.create({ value: false });
              return this.E()
                .start()
                  .attrs({ name: menu.label })
                  .on('click', function() {
                    if ( self.currentMenu != null && self.currentMenu.parent == menu.id ) return;
                    if ( ! hasChildren.get() ) {
                      self.menuListener(menu.id);
                      self.pushMenu(menu.id);
                    }
                    slot.set(! slot.get());
                  })
                  .addClass('sidenav-item-wrapper')
                      .start().addClass('menu-label')
                      .enableClass('selected-root', slot)
                      .enableClass('selected-root', self.currentMenu$.map((currentMenu) => {
                        var selectedRoot = window.location.hash.replace('#', '') == menu.id ||
                          currentMenu != null &&
                          currentMenu.id == menu.id ||
                          currentMenu.parent == menu.id;
                        slot.set(selectedRoot);
                        return selectedRoot;
                      }))
                      .start('img').addClass('icon')
                        .attr('src', menu.icon)
                      .end()
                      .start('span')
                        .add(menu.label)
                      .end()
                      .start().enableClass('up-arrow', slot.map((slot) => {
                        return slot && hasChildren;
                      })).end()
                    .end()
                    .start().addClass('submenu')
                    .show(slot)
                      .select(dao_.where(self.EQ(self.Menu.PARENT, menu.id)), function(subMenu) {
                        hasChildren.set(true);
                        return this.E()
                          .start('li').addClass('sub-menu-item')
                            .on('click', function() {
                              if ( self.currentMenu != null && self.currentMenu.id != subMenu.id ) {
                                self.pushMenu(subMenu.id);
                              }
                            })
                            .add(subMenu.label)
                            .enableClass('selected-sub', self.currentMenu$.map((currentMenu) => {
                              return currentMenu != null && currentMenu.id === subMenu.id;
                            }))
                          .end();
                      })
                    .end()
                .end();
            })
          .end()

          .start().show(this.loginSuccess$)
            .addClass('top-nav')
            .tag({ class: 'foam.nanos.u2.navigation.ApplicationLogoView' })
            .start().addClass('navigation-components')
              .tag({ class: 'net.nanopay.ui.topNavigation.CurrencyChoiceView' })
              .tag({ class: 'foam.nanos.u2.navigation.NotificationMenuItem' })
              .tag({ class: 'foam.nanos.u2.navigation.UserInfoNavigationView' })
            .end()
          .end()
        .end();
      }
  ],

  listeners: [
    function updateView() {
      this.pushMenu(this.menuSearch);
    }
  ]
});
