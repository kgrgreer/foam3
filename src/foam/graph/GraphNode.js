/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graph',
  name: 'GraphNode',

  properties: [
    {
      name: 'id',
      class: 'String',
      documentation: `
        Graph node ID may differ from data's ID. For example,
        a userCapabilityJunction will go inside a GraphNode with
        the Capability's id.
      `,
      expression: function(data) {
        return data.id;
      }
    },
    {
      /**

       */
      name: 'forwardLinks',
      class: 'Array',
      documentation: `
        {
          id: String
          weight?: Integer
        }
      `,
      adapt: function (_, n) {
        // Remove duplicate entries
        var ids = new Set();
        var newArray = [];

        for ( const v of n ) {
          if (! ids.has(v.id) ){
            ids.add(v.id);
            newArray.push(v);
          }
        }

        return newArray;
      }
    },
    {
      name: 'inverseLinks',
      class: 'Array',
      documentation: `
        {
          id: String
          weight?: Integer
        }
      `,
    },
    {
      name: 'data'
    }
  ]
});
