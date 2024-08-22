/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ResetListener',
  extends: 'foam.dao.ProxySink',
  documentation: 'Turns all sink events into a reset event.',
  methods: [
    {
      name: 'put',
      code: function put(_, sub) {
        this.reset(sub);
      },
      swiftCode: 'reset(sub)'
    },
    {
      name: 'remove',
      code: function remove(_, sub) {
        this.reset(sub);
      },
      swiftCode: 'reset(sub)'
    },
  ]
});
