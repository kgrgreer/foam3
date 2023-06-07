/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.util',
  name: 'FluentSpec',
  flags: ['web'],

  documentation: `
    Represents an operation to be performed on a Fluent object.
    This can be used to specify Sequence steps in a journal.
    For more information, see the following:
    - foam.core.Fluent
    - foam.u2.async.Sequence
  `,

  methods: [
    {
      name: 'apply',
      args: [
        { name: 'fluent', type: 'foam.core.Fluent' }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.util',
  name: 'BaseFluentSpec',
  implements: [
    {
      flags: ['web'],
      path: 'foam.util.FluentSpec'
    }
  ],
  properties: [
    {
      class: 'String',
      name: 'id',
      factory: function () {
        return this.$UID;
      }
    }
  ]
})

foam.CLASS({
  package: 'foam.util',
  name: 'AddFluentSpec',
  extends: 'foam.util.BaseFluentSpec',

  documentation: `
    Specifies a call to .add() on a Fluent
  `,

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      name: 'spec'
    }
  ],

  methods: [
    function apply(fluent) {
      fluent.add(this.spec);
    }
  ]
});


foam.CLASS({
  package: 'foam.util',
  name: 'RemoveFluentSpec',
  extends: 'foam.util.BaseFluentSpec',

  documentation: `
    Specifies a call to .remove() on a Fluent
  `,

  properties: [
    {
      class: 'String',
      name: 'reference'
    }
  ],

  methods: [
    function apply(fluent) {
      fluent.remove(this.reference);
    }
  ]
});

foam.CLASS({
  package: 'foam.util',
  name: 'AddBeforeFluentSpec',
  extends: 'foam.util.BaseFluentSpec',

  documentation: `
    Specifies a call to .addBefore() on a Fluent
  `,

  properties: [
    {
      class: 'String',
      name: 'reference'
    },
    {
      class: 'foam.util.FObjectSpec',
      name: 'spec'
    }
  ],

  methods: [
    function apply(fluent) {
      fluent.addBefore(this.reference, this.spec);
    }
  ]
});
