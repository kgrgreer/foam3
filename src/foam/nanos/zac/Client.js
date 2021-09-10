/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.zac',
  name: 'Client',
  extends: 'foam.u2.Element',

  methods: [
    function render() {
      this.add('ZAC');
    }
  ]
});
