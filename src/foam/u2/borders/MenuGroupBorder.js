/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'MenuGroupBorder',
  extends: 'foam.u2.View',
  documentation: 'Border that adds a list of menus around child views',

  imports: ['menuDAO'],

  requires: ['foam.nanos.u2.navigation.ApplicationLogoView'],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    ^header {
      position: absolute;
      top: 0;
      display: flex;
      width: 100%;
      padding: 16px;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
    }
    ^body {
      flex: 1;
      height: 100%;
    }
    @media only screen and (min-width: /*%DISPLAYWIDTH.LG%*/ 960px) {
      ^logo svg {
        height: 32px;
      }
    }
  `,
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Array',
      name: 'menuIds',
      documentation: `Array of menu items displayed in the border
        Ex: [['menuId1', { <viewProps≥: <values>, ...}], ...]
      `,
      adaptArrayElement: function(n) {
        if ( typeof n != 'string' ) return n;
        return [n, { buttonStyle: 'TERTIARY' }];
      }
    },
    ['menuArray_', []]
  ],
  methods: [
    function init() {
      this.menuIds$.sub(this.updateMenus);
      this.updateMenus();
      this
      .addClass()
      .start()
        .addClass(this.myClass('header'))
        .start(this.ApplicationLogoView)
          .addClass(this.myClass('logo'))
        .end()
        .add(this.slot(function(menuArray_) {
          let el = this.E();
          for ( i of menuArray_ ) {
            el.tag(i[0], i[1]);
          }
          return el;
        }))
      .end()
      .start('div', null, this.content$)
        .addClass(this.myClass('body'))
      .end();
    }
  ],

  listeners: [
    {
      name: 'updateMenus',
      code: async function() {
        let pArr = [];
        let temp = [];
        this.menuIds.forEach(v => {
          pArr.push(this.menuDAO.find(v[0]));
          temp.push(['', v[1]]);
        });
        let mArr = await Promise.all(pArr);
        for ( let i = 0; i < mArr.length; i++ ) {
          temp[i][0] = mArr[i];
        }
        this.menuArray_ = temp.filter(v => v[0]);
      }
    }
  ]
});
