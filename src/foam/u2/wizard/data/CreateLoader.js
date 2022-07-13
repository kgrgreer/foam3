/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'CreateLoader',
  implements: ['foam.u2.wizard.data.Loader'],

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      name: 'spec'
    },
    {
      class: 'Class',
      name: 'of',
      expression: function (spec) {
        return this.__subContext__.lookup(spec.class);
      }
    },
    {
      class: 'Object',
      name: 'args',
      expression: function (spec) {
        const cloned = { ...spec };
        delete cloned.class;
        return cloned;
      }
    }
  ],

  methods: [
    async function load() {
      return this.of.create(this.args, this);
    }
  ]
});
