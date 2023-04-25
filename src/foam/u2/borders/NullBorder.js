/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'NullBorder',
  extends: 'foam.u2.Element',

  documentation: `
    An unstyled border. Intended for use as a default value for
    border properties.
  `,

  properties: [
    {
      class: 'StringArray',
      name: 'cssClasses'
    },
  ],

  methods: [
    function render() {
      this.addClass(...this.cssClasses).tag('', {}, this.content$);
    }
  ]
});
