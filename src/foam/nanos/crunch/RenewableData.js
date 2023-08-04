/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'RenewableData',

  documentation: `
    Capability data that may expire and require renewal by a user should extend this class.
  `,

  sections: [
    {
      name: 'reviewDataSection',
      title: 'Confirmation',
      isAvailable: function(renewable) { return renewable; }
    }
  ],

  messages: [
    { name: 'CONFIRMATION_MSG', message: 'I agree that all the information provided above is accurate and up to date' },
    { name: 'REVIEW_ERROR', message: 'Certification required' }
  ],

  properties: [
    {
      name: 'renewable',
      class: 'Boolean',
      section: 'reviewDataSection',
      hidden: true,
      javaSetter: `
        // Reset reviwed when a ucj goes into renewable period
        if ( ! getRenewable() && val ) {
          setReviewed(false);
        }
        renewable_ = val;
        renewableIsSet_ = true;
      `
    },
    {
      name: 'reviewed',
      class: 'Boolean',
      label: '',
      section: 'reviewDataSection',
      view: function(_, X) {
        return {
          class: 'foam.u2.CheckBox',
          label: X.data.CONFIRMATION_MSG
        };
      },
      validationPredicates: [
        {
          args: ['renewable', 'reviewed'],
          query: 'renewable==false||reviewed==true',
          errorMessage: 'REVIEW_ERROR'
        }
      ]
    },
    {
      name: 'dataConfiguredExpiry',
      class: 'Boolean',
      hidden: true,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      name: 'expiry',
      class: 'DateTime',
      hidden: true
    }
  ]
});
