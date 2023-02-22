/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryPurgeCmd',
  documentation: `Instruction to internalMedusaDAO to remove entries between min and max index, inclusive`,

  properties: [
    {
      class: 'Long',
      name: 'minIndex'
    },
    {
      class: 'Long',
      name: 'maxIndex'
    },
    {
      class: 'Long',
      name: 'purged'
    }
  ]
});
