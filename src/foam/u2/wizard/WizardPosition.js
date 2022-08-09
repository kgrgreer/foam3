/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'WizardPosition',

  documentation: `
    Identifies a specific screen in a StepWizardlet view by specifying:
    - the index in an array of wizardlets, and
    - the index of a section in the data model
  `,

  properties: [
    {
      name: 'wizardletIndex',
      class: 'Int'
    },
    {
      name: 'sectionIndex',
      class: 'Int'
    }
  ],

  methods: [
    function compareTo(b) {
      let a = this;
      let wizardletDiff = a.wizardletIndex - b.wizardletIndex;
      if ( wizardletDiff != 0 ) return wizardletDiff;
      return a.sectionIndex - b.sectionIndex;
    },
    function apply(list) {
      return list[this.wizardletIndex][this.sectionIndex];
    },
    {
      name: 'hash',
      documentation: `
        Turns this wizard position into a unique id that can be used in a map.
      `,
      code: function hash() {
        var a = this.wizardletIndex;
        var b = this.sectionIndex;
        return (a + b) * (a + b + 1) / 2 + a;
      }
    },
    function getNext(wizardlets) {
      let wi = this.wizardletIndex;

      // Move to next section if one exists
      if ( this.sectionIndex < wizardlets[wi].sections.length - 1 ) {
        return this.cls_.create({
          wizardletIndex: wi,
          sectionIndex: this.sectionIndex + 1
        }, this.__context__)
      }

      // Move to next wizardlet if one exists,
      //   but skip wizardlets with no sections
      wi++;
      while ( wi < wizardlets.length ) {
        if ( wizardlets[wi].sections.length > 0 ) return this.cls_.create({
          wizardletIndex: wi,
          sectionIndex: 0
        }, this.__context__);
        wi++;
      }

      return null;
    },
    function getPrevious(wizardlets) {
      let wi = this.wizardletIndex;

      // Move to previous section if one exists
      if ( this.sectionIndex > 0 ) {
        return this.cls_.create({
          wizardletIndex: wi,
          sectionIndex: this.sectionIndex - 1
        }, this.__context__)
      }

      // Move to previous wizardlet if one exists
      wi--;
      while ( wi >= 0 ) {
        if ( wizardlets[wi].sections.length > 0 ) return this.cls_.create({
          wizardletIndex: wi,
          sectionIndex: 0
        }, this.__context__);
        wi--;
      }

      return null;
    },
    function* iterate(wizardlets, isBackwards) {
      const iterFunc = isBackwards ? 'getPrevious' : 'getNext';

      let pos = this;
      while ( true ) {
        pos = pos[iterFunc](wizardlets);
        if ( pos == null ) return;
        yield pos;
      }
    }
  ]
});
