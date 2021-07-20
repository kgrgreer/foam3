/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'RemoteException',
  extends: 'foam.core.FOAMException',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.core.Exception',
      name: 'exception'
    }
  ]
});
