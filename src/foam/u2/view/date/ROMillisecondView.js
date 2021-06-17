/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'ROMillisecondView',
  extends: 'foam.u2.View',

  documentation: 'A ReadOnly DateView for Long (millisecond) time.',

  methods: [
    function initE() {
      this.SUPER();
      this.start().
        addClass(this.myClass()).
        add(this.data$.map(d => d ? new Date(d).toISOString() : d)).
      end();
    }
  ]
});
