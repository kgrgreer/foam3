/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/


foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'BackgroundCard',
  extends: 'foam.dashboard.view.Card',
  documentation: '',
  css: `
  `,
  properties: [
    {
      class: 'String',
      name: 'data'
    },
    {
      name: 'backgroundColor',
      class: 'String'
    }
  ],
  methods: [
    function init() {
      this.addClass()
        .addClass('flexCenter')
        .style({ background: foam.CSS.returnTokenValue(this.backgroundColor, this.cls_, this.__subContext__) })
        .tag('', {}, this.content$);
    }
  ]
});
