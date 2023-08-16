/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'Axiom',

  ids: ['name', 'parentId'],

  properties: [
    {
      name: 'axiom'
    },
    {
      class: 'String',
      name: 'parentId'
    },
    {
      class: 'String',
      name: 'name',
      factory: function() {
        return this.axiom.name;
      }
    },
    {
      class: 'String',
      name: 'documentation',
      factory: function() {
        return this.axiom.documentation;
      }
    },
    {
      class: 'Boolean',
      name: 'hasPermission',
      value: true
    }
  ]
});
