/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.controllers',
  name: 'WizardController',
  extends: 'foam.u2.Controller',

  issues: [
    'should not depend on legacy controller'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data',
      label: 'legacy controller',
      documentation: 'legacy controller'
    },
    {
      class: 'Function',
      name: 'onClose'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      documentation: `
        Represents the desired view to render the current wizard contents.
        Form subclasses can choose how they want to use this.
      `,
      value: {
        class: 'foam.u2.borders.NullBorder'
      }
    }
  ],

  methods: [
    async function setFirstPosition() {
      // noop
    }
  ]
});
