/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'VerticalMenu',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currentMenu',
    'loginSuccess',
    'menuDAO',
    'pushMenu',
    'theme',
    'isMenuOpen?',
    'displayWidth?'
  ],

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.VerticalMenu',
    'foam.dao.ArraySink'
  ],

  cssTokens: [
    {
      name: 'menuBackground',
      value: '$white'
    },
    {
      name: 'borderSize',
      value: '1px solid $grey200'
    },
    {
      name: 'boxShadowSize',
      value: '0px'
    }
  ],

  css: `
  ^ input[type="search"] {
    width: 100%;
  }

  ^ {
    background: $menuBackground;
    border-right: $borderSize;
    box-shadow: $boxShadowSize;
    color: $grey500;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    padding-top: 16px;
    overflow: auto;
    width: 100%;
  }

  ^ .side-nav-view,
  ^ .side-nav-view .foam-u2-view-TreeViewRow  {
    width: 100%;
  }

  ^search {
    box-sizing: border-box;
    padding: 0 8px 8px 8px;
    text-align: center;
    width: 100%;
  }

  ^menuList {
    flex: 1;
    height: 100%;
  }

  @media only screen and (min-width: 768px) {
    ^ .side-nav-view,
    ^ .side-nav-view .foam-u2-view-TreeViewRow  {
      width: 240px;
    }
  }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'subMenu',
      documentation: 'Used to store selected submenu element after window reload and scroll into parent view'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      expression: function(menuDAO) {
        return menuDAO;
      }
    },
    {
      class: 'String',
      name: 'menuSearch',
      view: {
        class: 'foam.u2.SearchField',
        onKey: true,
        ariaLabel: 'Menu Search',
        autocomplete: false
      },
      value: ''
    },
    {
      name: 'nodeName',
      value: 'nav'
    }
  ],

  methods: [
    function render() {
      var self = this;
      this
      .addClass(this.myClass())
        .callIf(this.theme.showNavSearch, function(){
          this
          .startContext({ data: this })
            .start()
            .add(this.MENU_SEARCH)
              .addClass(this.myClass('search'))
            .end()
            .endContext()
        })
        .start({
          class: 'foam.u2.view.TreeView',
          data: self.dao_.where(self.EQ(self.Menu.ENABLED, true)),
          relationship: foam.nanos.menu.MenuMenuChildrenRelationship,
          startExpanded: true,
          query: self.menuSearch$,
          onClickAddOn: function(data, hasChildren) { self.openMenu(data, hasChildren); },
          selection$: self.currentMenu$.map(m => m),
          formatter: function(data) {
            this.translate(data.id + '.label', data.label);
          },
          defaultRoot: self.theme.navigationRootMenu
        })
          .addClass(this.myClass('menuList'))
        .end();
    },

    function openMenu(menu, hasChildren) {
      if ( menu.handler ) {
        // When menu is opened close it if window size is small(e.g. phone or tablet) and there are no sub menus
        if ( ! hasChildren && this.displayWidth?.ordinal <= foam.u2.layout.DisplayWidth.MD.ordinal )
          this.isMenuOpen = false;

          menu.handler.select(this.__context__, menu);
//        menu.handler.launch(this.__context__, menu);
        // this.pushMenu(menu, true);
      }
    }
  ]
});
