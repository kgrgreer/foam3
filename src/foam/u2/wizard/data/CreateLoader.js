/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'CreateLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  imports: [
    'wizardletOf'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      expression: function (wizardletOf) {
        return wizardletOf;
      }
    }
  ],
  
  methods: [
    async function load() {
      return this.of.create({}, this);
    }
  ]
});
