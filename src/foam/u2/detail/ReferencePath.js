/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'ReferencePath',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.detail.ReferencePath',
      name: 'parent',
    },
    {
      class: 'Object',
      name: 'current',
    },
    {
      class: 'Boolean',
      name: 'valid',
      expression: function (parent, current) {
        return ! parent || ! parent.conflicts(current);
      }
    }
  ],

  methods: [
    function conflicts(reference) {
      if ( ! this.valid ) return true;
      if ( reference === this.current ) return true;
      if ( this.parent ) return this.parent.conflicts(reference);
      return false;
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'TestReferencePathView',
  extends: 'foam.u2.View',

  imports: [
    'referencePath?'
  ],

  methods: [
    function render() {
      this.add(this.slot(function (data) {
        return this.E().add(
          ( this.referencePath && this.referencePath.conflicts(data) )
            ? 'CONFLICT'
            : 'NO CONFLICT'
        )
      }));
    }
  ]
});