/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: This should be generated automatically
foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery.referencespec',
  name: 'ReferenceSpecPropertyView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.ReferenceSpec properties.',

  properties: [
    [ 'readView', { class: 'net.nanopay.liquidity.ucjQuery.referencespec.ReadWeakReferenceView' } ],
    [ 'writeView', { class: 'net.nanopay.liquidity.ucjQuery.referencespec.WeakReferenceView' } ]
  ],
});

