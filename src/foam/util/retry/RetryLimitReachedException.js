/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.retry',
  name: 'RetryLimitReachedException',
  extends: 'foam.core.FOAMException',
  javaGenerateConvenienceConstructor: false,

  javaCode: `
    public RetryLimitReachedException(String message) {
      super(message);
    }

    public RetryLimitReachedException(String message, Throwable cause) {
      super(message, cause);
    }
  `
});
