/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ActionReference',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'action'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      name: 'data'
    },
    {
      name: 'view',
      value: function(args, X) {
        return { class: 'foam.u2.ActionReferenceView' };
      }
    }
  ],
  methods: [
    function toE(args, X) {
      if ( foam.core.FObject.isInstance(X) ) {
        X = X.__subContext__.createSubContext({ actionReference: this });
      } else {
        X = X.createSubContext({ actionReference: this });
      }
      var a = foam.u2.ViewSpec.createView(this.view, args, this, X);
      return a;
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ActionReferenceView',
  extends: 'foam.u2.ActionView',
  imports: ['actionReference'],
  properties: [
    {
      name: 'action',
      factory: null,
      expression: function(actionReference) {
        return actionReference.action;
      }
    },
    {
      name: 'data',
      expression: function(actionReference) {
        return actionReference.data;
      }
    }
  ]
});

