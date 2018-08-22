/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Hold Ascendant FX specific properties`,

  // implements: [
  //   'net.nanopay.tx.AcceptAware'
  // ],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
  ],

  properties: [

  ],

  methods: [
    // TODO: support Accept
  ]
});
