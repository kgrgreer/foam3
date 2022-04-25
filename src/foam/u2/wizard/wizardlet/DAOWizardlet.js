/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'DAOWizardlet',
  extends: 'foam.u2.wizard.wizardlet.BaseWizardlet',

  requires: [
    'foam.u2.wizard.wao.DAOWAO'
  ],

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      factory: function () {
        return this.of.create({}, this.__context__);
      }
    },
    {
      class: 'String',
      documentation: `
        Optional path used to specify the location of the desired wizardlet's data object that will
        be updated.
      `,
      name: 'path'
    },
    {
      name: 'wao',
      factory: function() {
        return this.DAOWAO.create({ path: this.path, of: this.data.cls_ }, this.__context__);
      }
    }
  ]
});
