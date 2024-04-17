/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'SubMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [ 'foam.nanos.menu.SubMenuView' ],

  implements: ['foam.u2.Routable'],

  methods: [
    function select() {
      /** NOP **/
    },
    async function launch(X, menu) { 
      /** NOP **/ 
      if ( this.route ) {
        let sub = (await menu.children.select()).array.find(v => v.id == menu.id + '/' + this.route)
        return await sub?.launch();
      }
    }
    // Code below is for conventional style menus which pop-up,
    // which no longer happens as opening a menu just opens the tree view.
    /*
    function createView(X, menu, parent) {
      return this.SubMenuView.create({menu: menu, parent: parent}, X);
    },

    function launch(X, menu, parent) {
      var view = this.createView(X, menu, parent);
      view.open();
    }
    */
  ]
});
