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
    function launch(X, menu) {
      var self = this;
      X.stack.push(foam.u2.stack.StackBlock.create({ 
        view: () => {
          return menu.border ? {... menu.border, children: [ this.createView(X, menu) ]} : menu;
        },
        parent: X,
        id: menu.id,
        shouldResetBreadcrumbs: self.shouldResetBreadcrumbs,
        breadcrumbTitle$: menu.label$,
        popup$: this.popup$
      }));
    }
  ]
});
