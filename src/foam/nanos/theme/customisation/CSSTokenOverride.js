/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.theme.customisation',
  name: 'CSSTokenOverride',

  ids: ['theme', 'source'],

  implements: [
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],


  searchColumns: [
    'theme',
    'enabled',
    'source',
    'target'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.theme.Theme',
      name: 'theme',
      documentation: 'Id of the theme this override is applied on',
      updateVisibility: 'RO',
      tableCellFormatter: { class: 'foam.u2.view.ReferenceToSummaryCellFormatter'}
    },
    // {
    //   class: 'String',
    //   name: 'variant',
    //   documentation: 'Allows for variant based overrides - dark mode, Accessible themes etc'
    // },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'source',
      view: { class: 'foam.u2.view.ClassCompleterView' },
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'target',
      documentation: 'Contains replacement value for token in given context'
    }
  ]
});
