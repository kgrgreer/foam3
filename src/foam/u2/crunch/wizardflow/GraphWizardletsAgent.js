/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'GraphWizardletsAgent',
  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'capabilities',
    'capabilityGraph',
    'getWAO'
  ],

  exports: [
    'wizardlets'
  ],

  requires: [
    'foam.nanos.crunch.ui.PrerequisiteAwareWizardlet',
    'foam.u2.wizard.ProxyWAO'
  ],

  properties: [
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    },
    {
      class: 'Map',
      name: 'capabilityWizardletsMap'
    }
  ],

  methods: [
    async function execute() {
      const prerequisites = [...this.capabilities];
      const desiredCapability = prerequisites.pop();

      // Remove duplicates from prerequisite aware sub-lists (from server)
      // (these entries are not needed because GraphBuilder is being used here)
      const seen = new Set();
      const removeDuplicates = list => {
        for ( let i = 0 ; i < list.length ; i++ ) {
          const capability = list[i];
          if ( Array.isArray(capability) ) {
            removeDuplicates(capability);
            continue;
          }
          if ( seen.has(capability.id) ) {
            list.splice(i, 1);
            i--;
            continue;
          }
          seen.add(capability.id);
        }
      }
      removeDuplicates(prerequisites);

      this.wizardlets = await this.parseArrayToWizardlets(prerequisites, desiredCapability);

      // Wire wizardlets into a DAG by populating 'prerequisiteWizardlets'
      for ( 
        const [capabilityId, {wizardlets}]
        of Object.entries(this.capabilityWizardletsMap)
      ) {
        const graphNode = this.capabilityGraph.data[capabilityId];
        const prerequisiteWizardlets = graphNode.forwardLinks
          // Only add prerequisite wizardlets for capabilities with wizardlets
          .filter(id => this.capabilityWizardletsMap[id])
          // Always link the "primary" wizardlet of a capability
          .map(id => this.capabilityWizardletsMap[id].primaryWizardlet)
          ;

        // Link the primary wizardlet of each prerequisite of this capability
        //   to all of this capability's wizardlets
        for ( let wizardlet of wizardlets ) {
          wizardlet.prerequisiteWizardlets = prerequisiteWizardlets;
        }
      }
    },
    async function parseArrayToWizardlets(prereqs, parent) {
      const wizardlets = [];

      let x = { capability: parent };
      const afterWizardlet = this.adaptWizardlet(x, parent.wizardlet);
      const beforeWizardlet = this.adaptWizardlet(x, parent.beforeWizardlet);

      const rootWizardlets = [beforeWizardlet, afterWizardlet].filter(exists => exists);

      // Update a map of all capability IDs to their respective wizardlets
      if ( ! this.capabilityWizardletsMap[parent.id] ) {
        this.capabilityWizardletsMap[parent.id] = {
          primaryWizardlet: afterWizardlet,
          wizardlets: []
        };
      }
      this.capabilityWizardletsMap[parent.id].wizardlets.push(...rootWizardlets);

      if ( beforeWizardlet ) {
        beforeWizardlet.isAvailable$.follow(afterWizardlet.isAvailable$);
        afterWizardlet.data$ = beforeWizardlet.data$;
      }

      // Some prerequisite wizardlets can be "controlled" by their parent wizardlet.
      // The exception is a prerequisite shared with an earlier capability that has
      // already assumed control; in this situation we say the prerequisite is "lifted".
      const controlledPrereqWizardlets = new Set();

      for ( const capability of prereqs ) {
        // Perform a recursive call to get wizardlets for this prerequisite
        const subPrereqs = Array.isArray(capability) ? [...capability] : [capability];
        const subParent = subPrereqs.pop();
        const subWizardlets = await this.parseArrayToWizardlets(subPrereqs, subParent);
        const wizardlet = subWizardlets.pop();

        controlledPrereqWizardlets.add(wizardlet);

        // Update ordered wizardlet list
        wizardlets.push(...subWizardlets, wizardlet);
      }

      for ( let rootWizardlet of rootWizardlets ) {
        if ( this.isPrerequisiteAware(rootWizardlet) ) {
          const graphNode = this.capabilityGraph.data[parent.id];
          const prerequisiteWizardlets = graphNode.forwardLinks
            .filter(id => this.capabilityWizardletsMap[id])
            .map(id => this.capabilityWizardletsMap[id].primaryWizardlet)
            ;
          for ( const wizardlet of prerequisiteWizardlets ) {
            rootWizardlet.addPrerequisite(wizardlet, {
              lifted: ! controlledPrereqWizardlets.has(wizardlet)
            });
          }
        }
      }
      
      if ( beforeWizardlet ) wizardlets.unshift(beforeWizardlet);
      wizardlets.push(afterWizardlet);
      return wizardlets;
    },
    function adaptWizardlet({ capability }, wizardlet) {
      if ( ! wizardlet ) return null;
      wizardlet = wizardlet.clone(this.__subContext__);

      wizardlet.copyFrom({ capability: capability });

      var wao = wizardlet.wao;
      while ( this.ProxyWAO.isInstance(wao) ) {
        // If there's already something at the end, don't replace it
        if ( wao.delegate && ! this.ProxyWAO.isInstance(wao.delegate) ) break;
        if ( ! wao.delegate ) {
          wao.delegate = this.getWAO();
        }
      }

      return wizardlet;
    },
    function isPrerequisiteAware(wizardlet) {
      return this.PrerequisiteAwareWizardlet.isInstance(wizardlet);
    }
  ]
});
