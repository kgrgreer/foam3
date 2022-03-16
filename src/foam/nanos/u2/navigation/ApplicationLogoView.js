/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'ApplicationLogoView',
  extends: 'foam.u2.View',

  documentation: 'View displaying Application logo and name.',

  imports: [
    'group',
    'pushMenu',
    'theme'
  ],

  requires: [
    'foam.u2.tag.Image'
  ],

  css: `
    ^ {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    ^ img, ^ svg {
      height: 27px;
      max-height: 40px;
      width: 100%;
    }
  `,

  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .start(this.Image, {
          data$: this.slot(function(theme$topNavLogo) {
            return theme$topNavLogo;
          }),
          embedSVG: true
        })
        .end();
    }
  ]
});
