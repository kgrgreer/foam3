/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MenuView',
  extends: 'foam.u2.tag.Button',

  imports: [
    'menu',
    // If rendered in a dropdown, close the dropdown after launching menu
    'dropdown? as parentMenuDropdown'
  ],

  properties: [
    {
      name: 'label',
      expression: function(menu) { return menu.label || ''; }
    },
    {
      name: 'icon',
      expression: function(menu) { return menu.icon || ''; }
    },
    {
      name: 'themeIcon',
      expression: function(menu) { return menu.themeIcon || ''; }
    }
  ],

  listeners: [
    function click(evt) {
      this.SUPER(evt);
      let ret = this.menu.launch_(this.__subContext__, this);
      if ( ret && ret.then ) {
        this.loading_ = true;
        ret.then(() => { this.loading_ = false; })
      }
      if ( this.parentMenuDropdown ) this.parentMenuDropdown.close();
      return;
    }
  ]
});
