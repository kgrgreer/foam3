/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'LoggingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO Decorator which logs access to the delegate; useful for debugging.',

  requires: [ 'foam.dao.ArraySink' ],

  properties: [
    {
      type: 'DAO',
      name: 'delegate'
    },
    {
      name: 'name',
    },
    {
      name: 'logger',
      expression: function(name) {
        return console.log.bind(console, name);
      }
    },
    {
      class: 'Boolean',
      name: 'logReads'
    }
  ],

  methods: [
    function put_(x, obj) {
      this.logger('put', obj);
      return this.SUPER(x, obj);
    },

    function remove_(x, obj) {
      this.logger('remove', obj);
      return this.SUPER(x, obj);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      this.logger('select',
                  'skip', skip,
                  'limit', limit,
                  'order', order && order.toString(),
                  'predicate', predicate && predicate.toString());
      sink = sink || this.ArraySink.create();
      if ( this.logReads ) {
        var put = sink.put.bind(sink);
        var newSink = { __proto__: sink };
        newSink.put = function(o) {
          this.logger('read', foam.json.objectify(o));
          return put.apply(null, arguments);
        }.bind(this);
        return this.SUPER(x, newSink, skip, limit, order, predicate).then(function() {
          return sink;
        });
      }
      return this.SUPER(x, sink, skip, limit, order, predicate);
    },

    function removeAll_(x, sink, skip, limit, order, predicate) {
      this.logger('removeAll', skip, limit, order, predicate);
      return this.SUPER(x, sink, skip, limit, order, predicate);
    },

    function find_(x, id) {
      this.logger('find', id);
      return this.SUPER(x, id);
    }
  ]
});
