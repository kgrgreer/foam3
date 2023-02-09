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

  requires: [
    'foam.u2.detail.FlexSectionedDetailView'
  ],
  properties: [
    {
      name: 'capableObj',
      documentation: 'a capable object'
    }
  ],

  methods: [
    async function render() {
      this.SUPER();
      this.wizardlets = [];
      var view = this.start().addClass(this.myClass());
      for ( let i = 0; i < this.capableObj?.capablePayloads?.length; i++ ) {
        view.tag(this.FlexSectionedDetailView, {
          data: this.capableObj.capablePayloads[i].data
        });
      }
      return view.end();
    }
  ]
});
