/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'NSpecLookup',

  documentation: `Model providing simple key/value lookup map to replace one nspec id with another.
Intended to allow nspec renaming in Medusa. Including replacing a dao with a null dao, for example.
The nspec id is stored in the MedusaEntry.`,

  properties: [
    {
      name: 'id',
      label: 'Original',
      class: 'String'
    },
    {
      name: 'replacement',
      class: 'String'
    }
  ]
});
