/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedAwareMixin',

  implements: [
    'foam.nanos.auth.LastModifiedAware'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date',
      storageOptional: true,
      javaCompare: 'return 0;',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    }
  ]
});
