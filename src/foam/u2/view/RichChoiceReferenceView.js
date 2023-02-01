/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichChoiceReferenceView',
  extends: 'foam.u2.view.RichChoiceView',

  documentation: `
    View for editing ReferenceProperty-ies.
    Displayed value -row view- summary = this.fullObject.toSummary();
  `,
  requires: [
    'foam.u2.view.RichChoiceViewSection'
  ],

  properties: [
    {
      name: 'search',
      value: true
    }
  ],

  methods: [
    function fromProperty(prop) {
      this.SUPER(prop);
      if ( this.sections?.length == 0 ) {
        let dao = this.__context__[prop.targetDAOKey] || this.__context__[foam.String.daoize(prop.of.name)];
        this.sections = [ this.RichChoiceViewSection.create({ heading: (prop.of?.model_?.plural || 'Selections'), dao: dao }) ];
      }
    }
  ]
});
