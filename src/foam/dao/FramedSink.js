/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FramedSink',
  extends: 'foam.dao.ProxySink',
  flags: [],

  documentation: 'A proxy that waits until the next frame to flush the calls to the delegate.',

  properties: [
    { class: 'Array', name: 'calls' },
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.calls.push(['put', [obj, s]]);
        this.flushCalls();
      }
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.calls.push(['remove', [obj, s]]);
        this.flushCalls();
      }
    },
    {
      name: 'eof',
      code: function() {
        this.calls.push(['eof', []]);
        this.flushCalls();
      }
    },
    {
      name: 'reset',
      code: function(s) {
        this.calls = [['reset', [s]]];
        this.flushCalls();
      }
    }
  ],

  listeners: [
    {
      name: 'flushCalls',
      isMerged: 100,
      code: function() {
        var calls = this.calls;
        this.calls = [];
        for (var i = 0, o; o = calls[i]; i++) {
          this.delegate[o[0]].apply(this.delegate, o[1]);
        }
      }
    }
  ]
});
