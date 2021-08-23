/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dao',
  name: 'CompositeRelationship',

  documentation: 'A model which aggregates relationships',

  properties: [
    {
      name: 'primaryRelationships',
      factory: function(){
        return [];
      }
    },
    {
      name: 'secondaryRelationships',
      factory: function(){
        return []
      }
    }
  ],

  methods: [
    {
      name: 'getPrimaryInverseNames',
      code: function(){
        return this.primaryRelationships.map(relationship => relationship.inverseName);
      }
    },
    {
      name: 'getPrimaryForwardNames',
      code: function(){
        return this.primaryRelationships.map(relationship => relationship.forwardName);
      }
    },
    {
      name: 'getSecondaryInverseNames',
      code: function(){
        return this.secondaryRelationships.map(relationship => relationship.inverseName);
      }
    },
    {
      name: 'getSecondaryForwardNames',
      code: function(){
        return this.secondaryRelationships.map(relationship => relationship.forwardName);
      }
    }
  ]
});
