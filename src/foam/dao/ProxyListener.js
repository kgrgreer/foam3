/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyListener',
  flags: ['js', 'swift'],

  implements: ['foam.dao.Sink'],

  properties: [
    {
      name: 'predicate',
      swiftType: 'foam_mlang_predicate_Predicate?'
    },
    {
      class: 'Proxy',
      of: 'foam.dao.Sink',
      name: 'delegate'
    },
    {
      name: 'innerSub',
      type: 'foam.core.Detachable',
      swiftPostSet: 'if let s = newValue { onDetach(s) }'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      swiftPostSet: `
self.innerSub?.detach()
try? self.innerSub = newValue?.listen_(__context__, self, predicate)
if oldValue != nil {
  self.reset(Subscription(detach: {}))
}
      `
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, s) {
        this.delegate.put(obj, this);
      },
      swiftCode: 'delegate.put(obj, self)',
    },

    function outputJSON(outputter) {
      outputter.output(this.delegate);
    },

    {
      name: 'remove',
      code: function remove(obj, s) {
        this.delegate.remove(obj, this);
      },
      swiftCode: 'delegate.remove(obj, self)',
    },

    {
      name: 'reset',
      code: function reset(s) {
        this.delegate.reset(this);
      },
      swiftCode: 'delegate.reset(self)',
    },

    function detach() {
      if ( this.innerSub ) this.innerSub.detach();
      this.SUPER();
    }
  ],

  listeners: [
    {
      name: 'update',
      code: function() {
        var old = this.innerSub;
        old && old.detach();
        this.innerSub = this.dao &&
          this.dao.delegate &&
          this.dao.delegate.listen_(this.__context__, this, this.predicate);
        this.reset();
      }
    }
  ]
});
