/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapablePayloadROView',
  extends: 'foam.u2.View',
  documentation: 'A view for displaying capable objects',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name:'viewView',
      value: { class: 'foam.u2.detail.VerticalDetailView' }
    }
  ],
  methods: [
    function render() {
      this.SUPER();
      this.tag({...this.viewView, data$: this.data.data$ });
    }
  ]
});
