/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'CreatedByAware',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      externalTransient: true,
      documentation: 'User who created the entry',
      tableCellFormatter: { class: 'foam.u2.view.ReferenceToSummaryCellFormatter' },
      section: 'userInformation',
      columnPermissionRequired: true,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent acting as User who created the entry',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      externalTransient: true,
      tableCellFormatter: { class: 'foam.u2.view.ReferenceToSummaryCellFormatter' },
      section: 'userInformation',
      columnPermissionRequired: true,
      gridColumns: 6
    }
  ]
});
