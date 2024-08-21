/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Sequence',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  properties: [
    {
      class: 'Array',
      type: 'foam.dao.Sink[]',
      name: 'args'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.args.forEach(function(a) { a.put(obj, s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].put(obj, sub);
}`
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.args.forEach(function(a) { a.remove(obj, s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].remove(obj, sub);
}`
    },
    {
      name: 'reset',
      code: function(s) {
        this.args.forEach(function(a) { a.reset(s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].reset(sub);
}`
    },
    function toString() {
      return 'SEQ(' + this.args.map(function(a) { return a.toString(); }).join(',') + ')';
    }
  ]
});
