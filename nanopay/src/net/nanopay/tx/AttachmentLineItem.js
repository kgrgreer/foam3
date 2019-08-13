/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AttachmentLineItem',

  extends: 'net.nanopay.tx.InfoLineItem',

  properties: [
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'file'
    }
  ]
});
