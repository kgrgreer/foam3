/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'CreateLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  imports: [
    'wizardletOf?'
  ],

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      name: 'spec',
      factory: function(){
        return {
          class: this.wizardletOf?.id
        }
      }
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
    async function load(o) {
      // If CreateLoader has a delegate we assume copyFrom is expected
      if ( this.delegate ) {
        const delegateResult = await this.delegate.load(o);
        if ( delegateResult ) {
          return delegateResult.copyFrom(this.args);
        }
      }

      // Otherwise behave as before
      return o?.old ?? this.of.create(this.args, this);
    }
  ]
});
