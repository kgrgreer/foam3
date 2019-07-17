/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ReferenceLineItemCitationView',
  extends: 'foam.u2.CitationView',

  requires: [
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  methods: [
   function initE() {
      this.addClass(this.myClass());

      this.tag(this.SectionedDetailPropertyView, { 
        data$: this.data$,
        prop: this.of.REFERENCE_ID 
      })
    }
  ]
});
