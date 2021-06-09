/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ReviewCapabilityView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.crunch.ui.ReviewUCJView',
    'foam.u2.detail.SectionedDetailView'
  ],

  properties: [
    {
      name: 'capabilityId',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      controlAccessToDAOSummary: true
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .tag(this.ReviewUCJView, { data$: this.capabilityId$ })
        .tag(this.SectionedDetailView, {
          data$: this.data$
        })
        ;
    }
  ]
});
