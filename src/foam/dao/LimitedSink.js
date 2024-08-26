/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Long',
      name: 'limit'
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
        if ( this.count++ >= this.limit ) {
          sub && sub.detach();
        } else {
          this.delegate.put(obj, sub);
        }
      },
      swiftCode: `count += 1
if count <= limit {
  delegate.put(obj, sub)
}`,
      javaCode: `
if ( getCount() >= getLimit() ) {
  sub.detach();
} else {
  setCount(getCount() + 1);
  getDelegate().put(obj, sub);
}`
    },
    {
      name: 'remove',
      code: function remove(obj, sub) {
        if ( this.count++ >= this.limit ) {
          sub && sub.detach();
        } else {
          this.delegate.remove(obj, sub);
        }
      },
      swiftCode: `count += 1
if count <= limit {
  delegate.remove(obj, sub)
}`,
      javaCode: `if ( getCount() >= getLimit() ) {
          sub.detach();
        } else {
          setCount(getCount() + 1);
          getDelegate().put(obj, sub);
        }`
    }
  ]
});
