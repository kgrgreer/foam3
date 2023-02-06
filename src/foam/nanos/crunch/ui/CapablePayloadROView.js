/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapablePayloadROView',
  extends: 'foam.u2.View',
  documentation: 'A view for displaying capable objects',

  imports: [
    'crunchController',
    'notify',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.detail.SectionView',
    'foam.layout.Section',
    'foam.u2.crunch.wizardflow.LoadCapabilityGraphAgent',
    'foam.u2.crunch.wizardflow.GraphWizardletsAgent',
    'foam.u2.wizard.agents.RootCapabilityAgent',
    'foam.u2.PropertyBorder',
    'foam.u2.layout.GUnit',
    'foam.u2.layout.Grid',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.detail.FlexSectionedDetailView'
  ],

  css: `
    ^ .foam-u2-detail-SectionedDetailPropertyView .foam-u2-CheckBox-label {
      top: 0px;
      position: relative;
    }
  `,

  properties: [
    {
      name: 'capableObj',
      documentation: 'a capable object'
    },
    // {
    //   class: 'FObjectArray',
    //   of: 'foam.u2.wizard.wizardlet.BaseWizardlet',
    //   name: 'wizardlets',
    //   documentation: 'wizardlets for capable payloads',
    //   // postSet: function(_, n) {
    //   //   this.listenOnWizardlets();
    //   // }
    // },
    // {
    //   class: 'Array',
    //   name: 'wizardletSectionsList',
    //   documentation: `
    //     sections for wizardlets
    //     wizardletSectionsList[i] stores sections for wizardlets[i]
    //   `,
    //   factory: function() {
    //     return this.wizardlets.map(wizardlet =>
    //       this.AbstractSectionedDetailView.create({
    //         of: wizardlet.of
    //       }).sections);
    //   }
    // },
    // {
    //   class: 'Boolean',
    //   name: 'showTitle'
    // }
  ],

  methods: [
    
    async function render() {
      this.SUPER();
      this.wizardlets = [];
      var view = this.start().addClass(this.myClass());
      for ( let i = 0; i < this.capableObj?.capablePayloads?.length; i++ ) {
        let cp = this.capableObj.capablePayloads[i];
        let data = cp.data;
        // OPTION ONE
        // let sequence = await this.crunchController.createTransientWizardSequence(this.__subContext__)
        //   .addBefore('ConfigureFlowAgent',
        //     { class: this.RootCapabilityAgent,
        //       name: 'RootCapabilityAgent',
        //       rootCapability: cp.capability
        //     })
        //   .addBefore('CreateWizardletsAgent', this.LoadCapabilityGraphAgent)
        //   .addBefore('CreateWizardletsAgent', this.GraphWizardletsAgent)
        //   .remove('CreateWizardletsAgent')
        //   .remove('GrantedEditAgent')
        //   .remove('CapabilityStoreAgent');
        // let w = await x.crunchController.wizardSequenceToViewSequence_(sequence)
        //   .execute().then(s => s.wizardlets);
        // this.wizardlets = this.wizardlets.concat(w);

        //   this.start().addClass(this.myClass())
        //   .forEach(this.wizardlets, function (w, wi) {
        //     this.add(foam.core.ExpressionSlot.create({
        //       args: [w.sections$, w.data$],
        //       code: (sections, data) => {
        //         return sections.map(section => section.createView({
        //           showTitle: self.showTitle,
        //           wizardlet: w,
        //         }));
        //       }
        //     }));
        //   })
        // .end();

        // OPTION TWO
        // view.start().tag(this.VerticalDetailView, { data: data }).end()
        view.start()
          .tag(this.FlexSectionedDetailView, {
            data: this.capableObj.capablePayloads[i].data
          })
        .end() 
      }
      return view.end();
    }
  ]
});
