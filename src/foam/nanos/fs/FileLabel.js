/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileLabel',
  documentation: 'Contextual label applied to a file instance',

  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'String',
      name: 'name'
    }
  ],

  methods: [
    function toSummary() {
      return this.id;
    }
  ]
})

