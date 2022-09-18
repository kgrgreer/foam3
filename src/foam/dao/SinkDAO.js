/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'SinkDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: [ 'js '],

  documentation: 'DAO which wraps Sink on Select.  Useful for client logic which does not directly have access to the select() and cannot call await itself, such as ChoiceView.',

  requires: [ 'foam.dao.ArraySink' ],

  properties: [
    {
      name: 'sink',
      class: 'FObjectProperty',
      of: 'foam.dao.ProxySink'
    }
  ],

  methods: [
    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        sink = sink || this.ArraySink.create();
        var s = sink;
        if ( this.sink ) {
          this.sink.delegate = s;
          s = this.sink;
        }

        return this.delegate.select_(x, s, skip, limit, order, predicate).then(function() { return sink; });
      }
    }
  ]
});
