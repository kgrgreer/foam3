/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Partition',

  properties: [
    {
      name: 'arg1'
    },
    {
      name: 'delegate'
    },
    {
      // TODO: Should be a map, but we need a HashMap in JS that
      // doesn't convert every key to a string.
      class: 'Array',
      name: 'partitions',
      factory: function() {
        return [];
      }
    }
  ],
  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.findPartition_(this.arg1.f(obj)).put(obj, s);
      }
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.findPartition_(this.arg1.f(obj)).remove(obj, s);
      }
    },
    {
      name: 'reset',
      code: function(s) {
        this.partitions.forEach(function(p) { p.reset(s); });
      }
    },
    {
      name: 'findPartition_',
      code: function(key) {
        for ( var i = 0 ; i < this.partitions.length ; i++ ) {
          if ( foam.util.equals(this.partitions[i][0], key) ) return this.partitions[i][1];
        }
        this.partitions.push([key, this.delegate.clone()]);
        return this.partitions[this.partitions.length - 1][1];
      }
    }
  ]
});
