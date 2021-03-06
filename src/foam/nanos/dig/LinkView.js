/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'LinkView',
  extends: 'foam.u2.View',

  properties: [ [ 'nodeName', 'a' ] ],

  methods: [
    function render() {
      this.SUPER();

      this
        .attrs({href: this.data$})
        .add(this.data$);
    }
  ]
});
