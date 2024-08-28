/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'SkipSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Long',
      name: 'skip'
    },
    {
      name: 'count',
      class: 'Int',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        if ( this.count < this.skip ) {
          this.count++;
          return;
        }

        this.delegate.put(obj, sub);
      },
      swiftCode: `if count < skip {
  count += 1
  return
}
delegate.put(obj, sub)`,
      javaCode: `if ( getCount() < getSkip() ) {
          setCount(getCount() + 1);
          return;
        }
        getDelegate().put(obj, sub);`
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        this.reset(sub);
      },
      swiftCode: `if count < skip {
  count += 1
  return
}
delegate.remove(obj, sub)`,
      javaCode: `if ( getCount() < getSkip() ) {
          setCount(getCount() + 1);
          return;
        }
        getDelegate().remove(obj, sub);`
    },
    {
      name: 'reset',
      code: function(sub) {
        this.count = 0;
        this.delegate.reset(sub);
      },
      swiftCode: 'count = 0;delegate.reset(sub);',
      javaCode: `setCount(0);getDelegate().reset(sub);`
    }
  ]
});
