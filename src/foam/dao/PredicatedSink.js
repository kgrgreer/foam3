/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PredicatedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      required: true,
      name: 'predicate'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.predicate.f(obj) ) this.delegate.put(obj, sub);
      },
      swiftCode: 'if predicate.f(obj) { delegate.put(obj, sub) }',
      javaCode: `
        try {
          if ( getPredicate().f(obj) ) getDelegate().put(obj, sub);
        } catch (ClassCastException exp) {
        }
      `
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        if ( this.predicate.f(obj) ) this.delegate.remove(obj, sub);
      },
      swiftCode: 'if predicate.f(obj) { delegate.remove(obj, sub) }',
      javaCode: 'if ( getPredicate().f(obj) ) getDelegate().remove(obj, sub);'
    }
  ]
});
