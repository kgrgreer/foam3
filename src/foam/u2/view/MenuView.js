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
    // If rendered in a dropdown, close the dropdown after launching menu
    'dropdown? as parentMenuDropdown'
  ],

  properties: [
    {
      name: 'label',
      factory: function() { return this.data.label || ''; }
    },
    {
      name: 'icon',
      factory: function() { return this.data.icon; }
    },
    {
      name: 'themeIcon',
      factory: function() { return this.data.themeIcon; }
    }
  ],

  listeners: [
    function click(evt) {
      this.SUPER(evt);
      this.data.launch_(this.__subContext__, this);
      if ( this.parentMenuDropdown ) this.parentMenuDropdown.close();
      return;
    }
  ]
});
