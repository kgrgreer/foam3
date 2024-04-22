/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'AbstractMenu',
  abstract: true,

  imports: [
    'menuListener?',
    'pushMenu',
    'translationService'
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'popup'
    },
    {
      class: 'Boolean',
      name: 'shouldResetBreadcrumbs',
      value: true
    }
  ],

  methods: [
    function select(X, menu) {
      /** Called when a menu is selected. **/
      X.routeTo(menu.id, true);
    },
    function launch(X, menu) {
      /** Called to activate a menu. **/
      if ( this.popup ) {
        X.popupManager.push((menu.border ? { ...menu.border, children: [ this.createView(X, menu) ] } : menu), this, this.popup);
        return;
      }
      X.stack.set(
        (menu.border ? { ...menu.border, children: [ this.createView(X, menu) ] } : menu),
        X
      )
    }
  ]
});
