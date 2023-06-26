/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.naons.crunch',
  name: 'CapabilityRefinement',
  refines: 'foam.nanos.crunch.Capability',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      name: 'lastModified',
      class: 'DateTime',
      section: '_defaultSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      section: '_defaultSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: {
        class: 'foam.u2.view.ReferencePropertyCellFormatter',
        propName: 'legalName'
      }
    },
    {
      name: 'lastModifiedByAgent',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      section: '_defaultSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: {
        class: 'foam.u2.view.ReferencePropertyCellFormatter',
        propName: 'legalName'
      }
    }
  ]
});
