/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.compare',

  methods: [
    function desc(c) {
      return foam.mlang.order.Desc.create({ arg1: c });
    },

    function toCompare(c) {
      return foam.Array.isInstance(c) ? foam.compare.compound(c) :
        foam.Function.isInstance(c)   ? foam.mlang.order.CustomComparator.create({ compareFn: c }) :
        c ;
    },

    // TODO: fix bug if combining ThenBy comparators
    function compound(args) {
      /* Create a compound comparator from an array of comparators. */
      var cs = args.map(foam.compare.toCompare);

      if ( cs.length === 0 ) return;
      if ( cs.length === 1 ) return cs[0];

      var ThenBy = foam.mlang.order.ThenBy;
      var ret, tail;

      ret = tail = ThenBy.create({head: cs[0], tail: cs[1]});

      for ( var i = 2 ; i < cs.length ; i++ ) {
        tail = tail.tail = ThenBy.create({head: tail.tail, tail: cs[i]});
      }

      return ret;
    }
  ]
});
