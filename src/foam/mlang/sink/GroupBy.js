/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupBy',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which behaves like the SQL group-by command.',

  // TODO: it makes no sense to name the arguments arg1 and arg2
  // because this isn't an expression, so they should be more meaningful
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.SinkProperty',
      name: 'arg2'
    },
    {
      class: 'Int',
      name: 'groupLimit',
      value: -1
    },
    {
      class: 'Map',
      name: 'groups',
      hidden: true,
      factory: function() { return {}; },
      javaFactory: 'return new java.util.HashMap<Object, foam.dao.Sink>();'
    },
    {
      class: 'List',
      hidden: true,
      name: 'groupKeys',
      transient: true,
      javaFactory: 'return new java.util.ArrayList(this.getGroups().keySet());',
      factory: function() {
        return Object.keys(this.groups);
      },
    },
    {
      class: 'Boolean',
      hidden: true,
      name: 'processArrayValuesIndividually',
      documentation: 'If true, each value of an array will be entered into a separate group.',
      factory: function() {
        // TODO: it would be good if it could also detect RelationshipJunction.sourceId/targetId
        return ! foam.core.MultiPartID.isInstance(this.arg1);
      }
    }
  ],

  methods: [
    {
      name: 'sortedKeys',
      javaType: 'java.util.List',
      args: [
        {
          name: 'comparator',
          type: 'foam.mlang.order.Comparator'
        }
      ],
      code: function sortedKeys(opt_comparator) {
        this.groupKeys.sort(opt_comparator || this.arg1.comparePropertyValues);
        return this.groupKeys;
      },
      javaCode:
`if ( comparator != null ) {
  java.util.Collections.sort(getGroupKeys(), comparator);
} else {
  java.util.Collections.sort(getGroupKeys());
}
return getGroupKeys();`
    },
    {
      name: 'putInGroup_',
      args: [
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        },
        {
          name: 'key',
          type: 'Object'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      code: function putInGroup_(sub, key, obj) {
        var group = this.groups.hasOwnProperty(key) && this.groups[key];
        if ( ! group ) {
          group = this.arg2.clone();
          this.groups[key] = group;
          if ( ! this.groupKeys.includes(key) )
            this.groupKeys.push(key);
        }
        group.put(obj, sub);
        this.pub('propertyChange', 'groups');
      },
      javaCode:
`foam.dao.Sink group = (foam.dao.Sink) getGroups().get(key);
 if ( group == null ) {
   group = (foam.dao.Sink) (((foam.core.FObject)getArg2()).fclone());
   getGroups().put(key, group);
   if ( ! this.getGroupKeys().contains(key) )
     getGroupKeys().add(key);
 }
 group.put(obj, sub);`
    },
    function reset() {
      this.arg2.reset();
      this.groups    = undefined;
      this.groupKeys = undefined;
    },
    {
      name: 'put',
      code: function put(obj, sub) {
        var key = this.arg1.f(obj);
        if ( this.processArrayValuesIndividually && Array.isArray(key) ) {
          if ( key.length ) {
            for ( var i = 0; i < key.length; i++ ) {
              this.putInGroup_(sub, key[i], obj);
            }
          } else {
            // Perhaps this should be a key value of null, not '', since '' might
            // actually be a valid key.
            this.putInGroup_(sub, '', obj);
          }
        } else {
          this.putInGroup_(sub, key, obj);
        }
        if ( this.groupLimit == this.groups.size ) sub.detach();
      },
      javaCode:
`Object arg1 = getArg1().f(obj);
if ( getProcessArrayValuesIndividually() && arg1 instanceof Object[] ) {
  Object[] keys = (Object[]) arg1;
  for ( Object key : keys ) {
    putInGroup_(sub, key, obj);
  }
} else {
  putInGroup_(sub, arg1, obj);
}
/*
if ( getGroupLimit() != -1 ) {
  System.err.println("************************************* " + getGroupLimit() + " " + getGroups().size() + " " + sub);
  Thread.dumpStack();
}*/
if ( getGroupLimit() == getGroups().size() && sub != null ) sub.detach();
`
    },

    function eof() { },

    {
      // TODO(adamvy): Is this right?  Seems like we should be overriding the foam2
      // fclone or deepClone method.
      name: 'clone',
      type: 'foam.mlang.sink.GroupBy',
      code: function clone() {
        // Don't use the default clone because we don't want to copy 'groups'.
        return this.cls_.create({ arg1: this.arg1, arg2: this.arg2 });
      },
      javaCode:
`GroupBy clone = new GroupBy();
clone.setArg1(this.getArg1());
clone.setArg2(this.getArg2());
return clone;`
    },

    {
      name: 'toString',
      code: function toString() {
        return 'groupBy(' + this.arg1 + "," + this.arg2 + "," + this.groupLimit + ')';
      },
      javaCode: 'return this.getGroups().toString();'
    },

    function toE(_, x) {
      return x.E('table').
        add(this.slot(function(arg1, groups) {
          return x.E('tbody').
            forEach(Object.keys(groups), function(g) {
              this.start('tr').
                start('td').add(g).end().
                start('td').add(groups[g]).end()
            });
        }));
    }
  ]
});
