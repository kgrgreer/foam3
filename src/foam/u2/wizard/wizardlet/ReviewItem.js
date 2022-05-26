/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'ReviewItem',
  extends: 'foam.comics.v2.namedViews.NamedViewInstance',
  implements: ['foam.mlang.Expressions'],

  requires: [
    'foam.core.AnyHolder'
  ],

  properties: [
    {
      name: 'border',
      class: 'foam.u2.ViewSpec',
      value: { class: 'foam.u2.borders.NullBorder' }
    },
    {
      name: 'headingBorder',
      class: 'foam.u2.ViewSpec',
      value: { class: 'foam.u2.borders.NullBorder' }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      documentation: `
        A predicate that must pass for this ReviewItem to be shown.
        Default value checks that the data is not null or undefined.
      `,
      factory: function () {
        return this.HAS(this.AnyHolder.VALUE);
      }
    },
    {
      class: 'String',
      name: 'title'
    }
  ]
});
