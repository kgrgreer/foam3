/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessDirectorArrayView',
  extends: 'foam.u2.view.FObjectArrayView',

  methods: [
    {
      name: 'init',
      code: function() {
        this.ADD_ROW.label = '+ Add Director';
      }
    }
  ],
});
