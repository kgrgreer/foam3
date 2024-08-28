/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'JournalSink',

  implements: [ 'foam.dao.Sink' ],
  flags: [],

  properties: [
    {
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'prefix',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(o) {
        var x = this.__context__; // TODO: is this always correct?
        this.journal.put(x, '', this.dao, o);
      }
    },
    {
      name: 'remove',
      code: function(o) {
        var x = this.__context__; // TODO: is this always correct?
        this.journal.remove(x, '', this.dao, o);
      }
    },
    {
      name: 'eof',
      code: function() {},
    },
    {
      name: 'reset',
      code: function() {
        console.warn('use of unimplemented JournalSink.reset()');
      }
    }
  ]
});
