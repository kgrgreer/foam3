/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'CompactionException',
  package: 'foam.nanos.medusa',
  extends: 'foam.nanos.medusa.MedusaException',

  javaCode: `
    public CompactionException(String message) {
      super(message);
    }

    public CompactionException(Throwable cause) {
      super(cause.getMessage(), cause);
    }

    public CompactionException(String message, Throwable cause) {
      super(message, cause);
    }
  `
});
