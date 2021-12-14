/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'DaggerException',
  package: 'foam.nanos.medusa',
  extends: 'foam.nanos.medusa.MedusaException',

  javaCode: `
    public DaggerException(String message) {
      super(message);
    }

    public DaggerException(Throwable cause) {
      super(cause.getMessage(), cause);
    }

    public DaggerException(String message, Throwable cause) {
      super(message, cause);
    }
  `
});
