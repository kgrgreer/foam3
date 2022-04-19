/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'PrimaryNotFoundException',
  javaExtends: 'foam.nanos.medusa.MedusaException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  javaCode: `
    public PrimaryNotFoundException() {
      super();
    }
  `
});
