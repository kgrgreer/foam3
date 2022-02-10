/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'SessionNotFoundException',
  package: 'foam.nanos.session',
  extends: 'foam.core.ClientRuntimeException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  javaCode: `
    public SessionNotFoundException() {
      super();
    }

    public SessionNotFoundException(String message) {
      super(message);
    }

    public SessionNotFoundException(Throwable cause) {
      super(cause);
    }

    public SessionNotFoundException(String message, Throwable cause) {
      super(message, cause);
    }
  `
});
