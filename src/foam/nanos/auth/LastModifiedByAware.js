/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAware',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      externalTransient: true,
      documentation: 'User who last modified entry',
      storageOptional: true,
      projectionSafe: false,
      tableCellFormatter: { class: 'foam.u2.view.ReferenceToSummaryCellFormatter' },
      section: 'userInformation',
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      externalTransient: true,
      documentation: 'Agent acting as User who last modified entry',
      storageOptional: true,
      projectionSafe: false,
      tableCellFormatter: { class: 'foam.u2.view.ReferenceToSummaryCellFormatter' },
      section: 'userInformation',
      gridColumns: 6
    }
  ]
});
