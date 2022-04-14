/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'AlternateFlow',

  imports: [
    'wizardlets?'
  ],

  properties: [
    // IDEA: maybe these two properties can come from a mixin
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'label'
    },

    {
      class: 'StringArray',
      name: 'available'
    },
    {
      class: 'StringArray',
      name: 'unavailable'
    },
    {
      class: 'StringArray',
      name: 'visible'
    },
    {
      class: 'StringArray',
      name: 'invisible'
    },
    {
      class: 'StringArray',
      name: 'removals'
    }
  ],

  methods: [
    function execute(x) {
      [
        ['unavailable', 'isAvailable', false],
        ['available', 'isAvailable', true],
        ['invisible', 'isVisible', false],
        ['visible', 'isVisible', true]
      ].forEach(([listProp, propToChange, newValue]) => {
        for ( const wizardletId of this[listProp] ) {
          const w = x.wizardlets.find(w => w.id == wizardletId);
          w[propToChange] = newValue;
        }
      })
    }
  ]
})
