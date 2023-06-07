/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'summary'
    }
  ],

  listeners: [
    {
      name: 'updateSummary',
      isFramed: true,
      on: [
        'data.propertyChange',
        'this.propertyChange.data'//TODO not optimal (we can delete the second)
      ],
      code: function() {
        this.summary = this.data ? this.data.toSummary() : undefined;
      }
    }
  ],

  methods: [
   function render() {
      this.SUPER();
      this.updateSummary();
      this.add(this.summary$);
    }
  ]
});
