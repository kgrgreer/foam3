/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'FacadeWizardletSpec',

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      of: 'foam.u2.wizard.data.Saver',
      name: 'saver',
      factory: () => ({ class: 'foam.u2.wizard.data.NullSaver' })
    },
    {
      class: 'String',
      name: 'wizardletId'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'loadFromFacadePath'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'loadIntoRealPath'
    },
    {
      class: 'Boolean',
      name: 'isOverridedWizardletVisible'
    }
  ]
})
