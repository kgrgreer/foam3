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
      class: 'FObjectArray',
      of: 'foam.dao.Relationship',
      name: 'relationships'
    }
  ],

  methods: [

  ]
});
