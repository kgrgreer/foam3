/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryRefinement',
  refines: 'foam.nanos.medusa.MedusaEntry',
  implements: [
    'foam.nanos.medusa.DaggerLink'
  ],

  documentation: 'Additional implementation seperated out to allow a minimal nanos build without all of Medusa'
})
