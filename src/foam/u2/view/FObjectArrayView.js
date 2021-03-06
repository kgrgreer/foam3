/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectArrayView',
  extends: 'foam.u2.view.ArrayView',

  css: `
    ^ .foam-u2-DetailView {
      border: 1px solid #ddd;
      margin-bottom: 8px;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'defaultNewItem',
      expression: function(of) {
        return foam.core.InterfaceModel.isInstance(of.model_)
          ? null
          : of.create(null, this.__subContext__);
      }
    },
    {
      name: 'valueView',
      expression: function(of) {
        return { class: 'foam.u2.DetailView' };
        /*
        return {
          class: 'foam.u2.view.CollapseableDetailView',
          view: {
            class: 'foam.u2.view.DraftDetailView',
            view: {
              class: 'foam.u2.view.FObjectView',
              of: of
            }
          }
        };
        */
      }
    }
  ],

  methods: [
    function fromProperty(p) {
      this.SUPER(p);
      if ( ! this.of && p.of ) this.of = p.of;
    }
  ]
});
