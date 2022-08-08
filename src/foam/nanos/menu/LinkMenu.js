/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'LinkMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  imports: [ 'window', 'buildingStack?', 'postToWindow?' ],

  documentation: 'A menu item which links to an external URL.',

  properties: [
    {
      class: 'URL',
      name: 'link'
    },
    {
      class: 'Boolean',
      name: 'openNewTab'
    }
  ],

  methods: [
    function launch(X, menu) {
      if ( this.openNewTab ) {
        this.window.open(this.link, '_blank');
      } else {
        if ( this.buildingStack$ ) this.buildingStack = true;
        this.window.location = this.link;
      }
      if ( menu.analyticsMessage ) {
        X.postToWindow?.post({ step: menu.analyticsMessage });
      }
    }
  ]
});
