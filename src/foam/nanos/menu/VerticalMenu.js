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
    'theme'
  ],

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.VerticalMenu',
    'foam.dao.ArraySink'
  ],

  css: `
  ^ input[type="search"] {
    width: 100%;
  }

  ^ {
    background: /*%WHITE%*/ #FFFFFF;
    border-right: 1px solid /*%GREY4%*/ #e7eaec;
    color: /*%GREY2%*/ #9ba1a6;
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
    padding: 0 8px;
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
          .startContext({ data: this })
          .start()
            .add(this.MENU_SEARCH)
            .addClass(this.myClass('search'))
          .end()
          .endContext()
          .start({
            class: 'foam.u2.view.TreeView',
            data$: self.dao_$,
            relationship: foam.nanos.menu.MenuMenuChildrenRelationship,
            startExpanded: true,
            query: self.menuSearch$,
            onClickAddOn: function(data) { self.openMenu(data); },
            selection$: self.currentMenu$.map(m => m),
            formatter: function(data) {
              this.translate(data.id + '.label', data.label);
            },
            defaultRoot: self.theme.navigationRootMenu
          })
            .addClass(this.myClass('menuList'))
          .end();
    },

    function openMenu(menu) {
      if ( menu.handler ) {
        this.pushMenu(menu, true);
      }
    }
  ]
});
