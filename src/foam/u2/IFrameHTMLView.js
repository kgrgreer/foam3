/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'IFrameHTMLView',
  extends: 'foam.u2.View',

  css: `
    iframe {
      border: 1px solid $grey300;
      padding: 8px;
      max-width: 100%;
      box-sizing: border-box;
      resize: both;
    }
  `,

  methods: [    
    function render() {
      this.SUPER();
      this.addClass();

      this.start('iframe')
        .attrs({ srcdoc: this.data })
        .on('load', evt => this.resizeIFrame(evt.target))
      .end();
    },

    function resizeIFrame(el) {
      // reset padding and margins of iframe document body
      el.contentDocument.body.style.padding = 0;
      el.contentDocument.body.style.margin = 0;

      // set iframe dimensions according to the document / its content
      el.style.height = Math.max(
        el.contentDocument.documentElement.scrollHeight,
        el.contentDocument.body.firstElementChild.scrollHeight
      );
      el.style.width = "100%";
    }
  ]
});
