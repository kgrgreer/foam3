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

  mixins: ['foam.u2.Router'],

  methods: [
    function select() {
      /** NOP **/
    },
    async function launch(X, menu) {
      // Force a memento update as the menus are cached and are not recreated so they are not subbed to memento like other attached objects
      this.memento_.str = this.memento_.parent.tailStr;
      this.memento_.propertyChange.pub('str', this.memento_.str$);
      if ( this.route ) {
        let sub = (await menu.children.select()).array.find(v => v.id == menu.id + '/' + this.route)
        return await sub?.launch();
      }
    }
  ]
});
