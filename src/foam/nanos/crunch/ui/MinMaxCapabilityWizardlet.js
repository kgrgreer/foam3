/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'MinMaxCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',
  implements: [
    'foam.nanos.crunch.ui.LiftingAwareWizardlet',
    'foam.nanos.crunch.ui.PrerequisiteAwareWizardlet'
  ],

  requires: [
    'foam.core.ArraySlot',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.ui.MinMaxCapabilityWizardletSection',
    'foam.u2.view.CardSelectView',
    'foam.u2.view.MultiChoiceView'
  ],

  imports: [
    'capabilityDAO',
    'translationService'
  ],

  properties: [
    {
      name: 'data',
      flags: ['web'],
      factory: function(){
        return foam.nanos.crunch.MinMaxCapabilityData.create();
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.Wizardlet',
      name: 'choiceWizardlets',
      factory: function() {
        return [];
      }
    },
    {
      name: 'min',
      class: 'Int',
      factory: function(){
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(this.capability) ){
          // a capability min of 0 denotes no minimum limit
          return this.capability.min > 0 ? this.capability.min : this.choices.length;
        }
      }
    },
    {
      name: 'max',
      class: 'Int',
      factory: function(){
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(this.capability) ){
          return this.capability.max;
        }
      }
    },
    {
      name: 'choices',
      expression: function(choiceWizardlets){
        var self = this;
        return choiceWizardlets.map(wizardlet => {
          var isFinal =
            wizardlet.status === this.CapabilityJunctionStatus.GRANTED ||
            wizardlet.status === this.CapabilityJunctionStatus.PENDING;

          return [wizardlet.capability, self.translationService.getTranslation(foam.locale, `${wizardlet.capability.id}.name`,wizardlet.title), isFinal]
        })
      }
    },
    {
      class: 'Boolean',
      name: 'isValid',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isVisible',
      expression: function (isAvailable, choices, hideChoiceView) {
        return isAvailable && choices.length > 0 && ! hideChoiceView;
      }
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      value: true,
      documentation: `
        Specify the availability of this wizardlet. If true, wizardlet is
        available if at least one section is available. If false, wizardlet
        does not display even if some sections are available.
      `,
      postSet: function(_,n){
        if ( !n ){
          this.selectedData = [];

          // to cascade hiding all descendent wizardlets
          // TODO: investigate why this is still needed,
          // setting data to empty array should have made isAvailable automatically evaluate to false
          let alternateFlow = this.__subContext__.sequence.contextAgentSpecs.filter(x => x.name == "AlternateFlowAgent");
          this.choiceWizardlets.forEach(cw => {
            for ( let af of alternateFlow ) {
              if ( af.spec.alternateFlow.available.filter(x => x == cw.instance_.of).length != 0 ) {
                return;
              }
            }

            cw.isAvailable = false
          });

          this.isAvailablePromise =
            Promise.all(this.choiceWizardlets.map(cw => cw.isAvailablePromise))
              .then(() => { this.cancel(); });
        } else {
          this.save();
        }
      }
    },
    {
      name: 'selectedData',
      postSet: function(_,n){
        this.data.selectedData = n.map(capability => capability.id);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'choiceSelectionView',
      factory: () => ({
        class: 'foam.u2.view.MultiChoiceView'
      })
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'choiceView',
      factory: () => ({
        class: 'foam.u2.view.CardSelectView'
      })
    },
    {
      name: 'sections',
      flags: ['web'],
      transient: true,
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.WizardletSection',
      factory: function() {
        // to account for isFinal: true in choices
        var finalData = this.choices.filter(choice => choice[2]).map(selectedChoice => selectedChoice[0]);
        var selectedData = finalData;

        // to account for previously selected data
        if ( this.data.selectedData.length > 0 ){
          var savedSelectedDataIds = [
            ...this.data.selectedData
          ];

          var savedSelectedData = [];

          // need to grab the selected capability objects
          for ( let i = 0; i < this.choices.length; i++ ){
            if ( savedSelectedDataIds.includes(this.choices[i][0].id) ){
              savedSelectedData.push(this.choices[i][0]);
            }

            if ( savedSelectedData.length === savedSelectedDataIds.length ) break;
          }

          selectedData = finalData.concat(savedSelectedData);
        }

        this.selectedData = selectedData;

        var sections = [
          this.MinMaxCapabilityWizardletSection.create({
            isAvailable: true,
            title: this.capability.name,
            choiceWizardlets$: this.choiceWizardlets$,
            isLoaded: true,
            customView: {
              ...this.choiceSelectionView,
              choices$: this.slot(function(choices) { return choices.sort(); }),
              isValidNumberOfChoices$: this.isValid$,
              showValidNumberOfChoicesHelper: false,
              data$: this.selectedData$,
              minSelected$: this.min$,
              maxSelected$: this.max$,
              choiceView: {
                ...this.choiceView,
                of: this.choices[0][0].cls_.id,
                largeCard: true
             }
            }
          })
        ];

        if ( this.of && this.showDefaultSections ){
          var ofSections = foam.u2.detail.AbstractSectionedDetailView.create({
            of: this.of,
          }, this).sections.map(section => this.WizardletSection.create({
            section: section,
            data$: this.data$,
            isAvailable$: section.createIsAvailableFor(
              this.data$,
            )
          }));

          sections = [
            ...ofSections,
            ...sections
          ]
        }
        return this.hideChoiceView ? [] : sections;
      }
    },
    {
      name: 'consumePrerequisites',
      documentation: `
        When true, report 'true' on calls to addPrerequisite to indicate that
        prerequisite wizardlets were handled by this wizardlet. This effectively
        prevents prerequisite wizardlets from displaying in a CRUNCH wizard.
      `,
      class: 'Boolean'
    },
    {
      name: 'hideChoiceView',
      documentation: `
        When true, do not display the choice selection section.
      `,
      class: 'Boolean'
    },
    {
      name: 'showDefaultSections',
      class: 'Boolean'
    }
  ],

  methods: [
    function addPrerequisite(wizardlet, opt_meta) {
      const meta = {
        lifted: false,
        ...opt_meta
      };
      this.choiceWizardlets.push(wizardlet);
      console.log('addPrerequisite', this.id, wizardlet.id, meta);

      // isAvailable defaults to false if this MinMax is in control of the
      //   prerequisite wizardlet
      if ( ! meta.lifted ) wizardlet.isAvailable = false;

      return this.consumePrerequisites;
    },
    function handleLifting(liftedWizardlets) {
      console.log('handleLifting', this.id, liftedWizardlets.map(w => w.id));
      const updated = () => {
        // Hide choice selection if lifted choices reach maximum
        const countLifted = liftedWizardlets
          .map(w => w.isAvailable ? 1 : 0)
          .reduce((count, val) => count + val);
        this.isVisible = countLifted < this.max && this.isAvailable;


        // Update lifted choices based on their availability
        let newSelectedData = [...this.selectedData];
        for ( const w of liftedWizardlets ) {
          if ( w.isAvailable ) newSelectedData.push(w.capability);
          else foam.Array.remove(newSelectedData, w.capability);
        }
        this.selectedData = foam.Array.unique(newSelectedData);
      }
      const slots = liftedWizardlets.map(w => w.isAvailable$);
      this.ArraySlot.create({ slots }).sub(updated);
      this.isAvailable$.sub(updated);
    }
  ]
});
