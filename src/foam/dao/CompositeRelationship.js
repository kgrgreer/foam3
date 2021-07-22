/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dao',
  name: 'CompositeRelationship',

  documentation: 'A model which aggregates relationships',

  properties: [
    {
      name: 'relationships'
    }
  ],

  methods: [
    {
      name: 'getInverseNames',
      code: function(){
        return this.relationships.map(relationship => relationship.inverseName);
      }
    },
    {
      name: 'getForwardNames',
      code: function(){
        return this.relationships.map(relationship => relationship.forwardName);
      }
    }
  ]
});
