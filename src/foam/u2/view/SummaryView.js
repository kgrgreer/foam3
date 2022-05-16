/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SummaryView',
  extends: 'foam.u2.View',

  methods: [
    function render () {
      this.add(this.data.toSummary());
    }
  ]
});
