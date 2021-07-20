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
    'menuListener',
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

  ^ .side-nav-view {
    background: /*%GREY5%*/ #f5f7fas;
    border-right: 1px solid /*%GREY4%*/ #e7eaec;
    color: /*%GREY2%*/ #9ba1a6;
    height: calc(100vh - 80px);
    overflow-x: hidden;
    position: absolute;
    z-index: 100;
  }

  ^search {
    box-sizing: border-box;
    margin-top: 14px;
    padding: 0 5px;
    text-align: center;
    width: 240px;
  }

  ^ .tree-view-height-manager {
    margin-bottom: 40px;
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
    }
  ],

  methods: [
    function render() {
      var self = this;
      this
      .addClass(this.myClass())
      .start()
        .addClass('side-nav-view')
        .start()
          .startContext({ data: this })
          .start()
            .add(this.MENU_SEARCH)
            .addClass(this.myClass('search'))
          .end()
          .endContext()
          .start()
            .addClass('tree-view-height-manager')
            .tag({
              class: 'foam.u2.view.TreeView',
              data$: self.dao_$,
              relationship: foam.nanos.menu.MenuMenuChildrenRelationship,
              startExpanded: true,
              query: self.menuSearch$,
              onClickAddOn: function(data) { self.openMenu(data); },
              selection$: self.currentMenu$,
              formatter: function(data) {
                this.translate(data.id + '.label', data.label);
              },
              defaultRoot: self.theme.navigationRootMenu
            })
          .end()
        .end()
      .end();
    },

    function openMenu(menu) {
      if ( menu.handler ) {
        this.pushMenu(menu);
        this.menuListener(menu);
      }
    }
  ]
});
