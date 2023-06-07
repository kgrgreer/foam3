/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.test',
  name: 'IdentifiedStringHolder',

  documentation: `
    Like StringHolder but can be put into a DAO. This is useful for convenient
    testing by creating a stringHolderDAO in development deployment journals.

    If this is ever deemed useful outside of testing it could be moved to exist
    in the same package as StringHolder.
  `,

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'value',
      class: 'String'
    }
  ]
});
