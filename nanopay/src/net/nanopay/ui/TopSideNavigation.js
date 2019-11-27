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
    'foam.nanos.menu.Menu'
  ],

  imports: [
    'currentMenu',
    'menuListener',
    'loginSuccess',
    'menuDAO',
    'pushMenu',
  ],

  css: `
    ^ .side-nav-view {
      display: inline-block;
      position: fixed;
      height: 100vh;
      width: 240px;
      padding-top: 75px;
      overflow-y: scroll;
      overflow-x: hidden;
      z-index: 100;
      font-size: 26px;
      color: /*%GREY2%*/ #9ba1a6;
      border-right: 1px solid /*%GREY4%*/ #e7eaec;
      background: /*%GREY5%*/ #f5f7fas;
    }
    ^ .selected-sub {
      color: /*%PRIMARY3%*/ #406dea;
      font-weight: 800;
    }
    ^ .submenu {
      max-height: 120px;
      overflow-y: scroll;
      overflow-x: hidden;
      font-size: 14px;
      border-bottom: 1px solid /*%GREY4%*/ #e7eaec;
    }
    ^ li:hover {
      cursor: pointer;
    }
    ^ .icon {
      width: 16px;
      height: 16px;
      padding-right: 10px;
      vertical-align: top;
    }
    ^ .up-arrow {
      margin-bottom: 6px;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
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
      border-left: 4px solid /*%GREY5%*/ #f5f7fa;
    }
    ^ .menu-label span {
      display: inline-block;
    }
    ^ .selected-root {
      width: 100%;
      border-left: 4px solid /*%PRIMARY3%*/ #406dea !important;
      background: /*%PRIMARY5%*/ #e5f1fc;
      color: /*%BLACK%*/ black;
    }
    ^ .menu-label:hover {
      width: 100%;
      border-left: 4px solid /*%PRIMARY3%*/ #406dea !important;
      background: /*%PRIMARY5%*/ #e5f1fc;
      color: /*%BLACK%*/ black;
    }
    ^ li {
      width: 100%;
      padding: 5px 0px 5px 50px;
    }
    ^ .foam-u2-view-RichChoiceView {
      margin-bottom: 20px;
    }
    ^ .foam-u2-view-RichChoiceView .search input {
      height: 40px;
    }
    ^ .foam-u2-view-RichChoiceView-selection-view {
      width: 240px;
      height: 40px;
      padding-left: 20px;
    }
    ^ .foam-u2-view-RichChoiceView-heading {
      padding: 10px;
    }
  `,

  properties: [
    {
      name: 'menuName',
      value: '' // The root menu
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'subMenu',
      documentation: 'Used to store selected submenu element after window reload and scroll into parent view'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      factory: function() {
        return this.menuDAO.orderBy(this.Menu.ORDER);
      }
    },
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
          searchPlaceholder: 'Search...',
          selectionView: { class: 'net.nanopay.ui.MenuChoiceSelection' },
          rowView: { class: 'net.nanopay.ui.MenuRowView' }
        };
      },
      factory: function() {
        return this.currentMenu;
      }
    }
  ],

  methods: [
      function initE() {
        var self = this;
        // Sets currentMenu and listeners on search selections and subMenu scroll on load.
        if ( window.location.hash != null ) this.menuListener(window.location.hash.replace('#', ''));

        this.start().addClass(this.myClass())
          .show(this.loginSuccess$)
          .start().addClass('side-nav-view')
            .tag(this.MENU_SEARCH)
            .select(this.dao_.where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
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
                      self.menuSearch = menu.id;
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
                    .select(self.dao_.where(self.EQ(self.Menu.PARENT, menu.id)), function(subMenu) {
                      hasChildren.set(true);
                      var e = this.E()
                        .start('li')
                          .attrs({ name: subMenu.id })
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
                      if ( self.currentMenu == subMenu ) self.subMenu = e;
                      return e;
                    })
                  .end()
                .end();
            })
          .end()
        .end()
        .tag({ class: 'net.nanopay.ui.TopNavigation' });

        this.menuSearch$.sub(this.menuSearchSelect);
        this.subMenu$.dot('state').sub(this.scrollToCurrentSub);
      }
  ],

  listeners: [
    async function menuSearchSelect() {
      var menu = await this.menuDAO.find(this.menuSearch);
      this.pushMenu(this.menuSearch);
      this.menuListener(menu);
      // Scroll to submenu selected from search.
      document.getElementsByName(this.menuSearch)[0].scrollIntoView({ block: 'end' });
    },
    function scrollToCurrentSub() {
      // When submenu element is loaded, scroll element into parent view TODO: Fix to align to middle of parent div.
      if ( this.subMenu.state === this.subMenu.LOADED ) {
        this.subMenu.el().scrollIntoView({ block: 'end' });
      }
    }
  ]
});
