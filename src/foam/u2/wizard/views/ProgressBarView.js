/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'ProgressBarView',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: 100%;
      -webkit-appearance: none;
      height: 2px;
    }
    ::-webkit-progress-bar {
      background-color: $grey100;
      border-radius: 25px;
    }
    ::-webkit-progress-value {
      background-color: $primary400;
      transition: all 0.2s ease;
    }
  `,

  properties: [
    [ 'nodeName', 'progress' ],
    {
      class: 'Int',
      name: 'progressMax'
    },
    {
      class: 'Int',
      name: 'progressValue'
    },
  ],

  methods: [
    function render() {
      this
        .addClass()
        .attr('max', this.progressMax$)
        .attr('value', this.progressValue$);
    }
  ]
});
