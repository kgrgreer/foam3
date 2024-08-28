/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'DAOSlot',
  implements: ['foam.core.Slot'],
  extends: 'foam.dao.ResetListener',
  flags: [],
  properties: [
    {
      name: 'dao',
      postSet: function() {
        this.start_();
      }
    },
    {
      name: 'sink',
      postSet: function(_, s) {
        this.value = s;
        this.start_();
      }
    },
    {
      name: 'value'
    },
    {
      name: 'subscription',
      postSet: function(old, nu) {
        old && old.detach();
        this.onDetach(nu);
      }
    },
    {
      class: 'Int',
      name: 'batch',
      value: 0
    }
  ],

  methods: [
    function sub(l) {
      return arguments.length === 1 ?
        this.SUPER('propertyChange', 'value', l) :
        this.SUPER.apply(this, arguments);
    },

    function get() { return this.value; },

    function set() {},

    function start_() {
      // Don't start till both sink and dao are set.
      if ( ! this.dao || ! this.sink ) return;

      this.subscription = this.dao.listen(this);
      this.update();
    },

    function reset() {
      this.update();
    }
  ],
  listeners: [
    {
      name: 'update',
      isMerged: 100,
      code: function() {
        var batch = ++this.batch;
        var self = this;
        this.dao.select(this.sink.clone()).then(function(s) {
          if ( self.batch !== batch ) return;

          self.value = s;
        });
      }
    }
  ]
});
