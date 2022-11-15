/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'SpinnerView',
  extends: 'foam.u2.View',

  documentation: `
    A view to display a single loading spinner of choice.
  `,

  properties: [
    {
      class: 'foam.uw.ViewSpec',
      name: 'spinner',
      value: 'foam.u2.LoadingSpinner'
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.start(this.spinner).end();
    }
  ]
});
