/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'ClusterException',
  package: 'foam.nanos.medusa',
  javaExtends: 'foam.core.FOAMException',

  javaCode: `
    public ClusterException(String message) {
      super(message);
    }

    public ClusterException(String message, Throwable cause) {
      super(message, cause);
    }
  `
});
