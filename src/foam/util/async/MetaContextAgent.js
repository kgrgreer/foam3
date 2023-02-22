/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.async',
  name: 'MetaContextAgent',
  implements: [
    'foam.core.ContextAgent'
  ],
  documentation: `
    If a context agent extends MetaContextAgent it will be treated differently
    by SequenceInstaller. See the documentation on SequenceInstaller for more
    information.
  `
});
