/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'PredicatedSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      of: 'foam.u2.wizard.data.Loader',
      name: 'loader'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate'
    }
  ],

  methods: [
    async function save (...a) {
      const loader = foam.json.parse(
        this.loader, undefined, this.__subContext__);
      const obj = await loader.load({});
      if ( ! this.predicate.f(obj) ) return;
      return await this.delegate.save(...a);
    }
  ]
});
