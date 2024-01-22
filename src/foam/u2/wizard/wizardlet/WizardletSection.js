/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'WizardletSection',
  flags: ['web'],

  documentation: `
    Describes a sub-section of a wizardlet.
  `,

  imports: [
    'showWizardletSectionTitles?'
  ],

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.detail.SectionView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.ViewSpec'
  ],

  properties: [
    {
      name: 'section',
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
      expression: function (wizardlet$of, modelSectionName) {
        var sections = this.AbstractSectionedDetailView.create({
          of: wizardlet$of,
        }, this).sections;
        return sections.find(s => s.name == modelSectionName) || null;
      },
      documentation: `
        An optional property for the original model section. This property must
        be set if customView is null.
      `
    },
    {
      class: 'String',
      name: 'modelSectionName'
    },
    {
      name: 'title',
      class: 'String',
      documentation: 'Full title of this section.',
      expression: function(section) {
        return section && section.title;
      }
    },
    {
      name: 'wizardlet',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.wizardlet.Wizardlet',
      documentation: `
        This is a reference to the aggregating wizardlet.
      `,
      cloneProperty: function (v, m) {
        m[this.name] = v;
      }
    },
    {
      name: 'data',
      documentation: `
        This property will be set by the aggregating wizardlet.
      `,
      expression: function (wizardlet$data) {
        return wizardlet$data;
      }
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      documentation: `
        This section is visible only when this property is true.
      `,
      expression: function(customView) { return customView ?? false; }
    },
    {
      name: 'isValid',
      class: 'Boolean',
      documentation: `
        Indicates if this section in isolation is valid. If a model section is
        specified, this is determined automatically. For a custom view, this
        property should be overridden.
      `,
      expression: function (wizardlet$of, data, data$errors_) {
        if ( ! wizardlet$of ) return true;
        if ( ! data ) return false;

        if ( ! this.section ) {
          return ! data.errors_ || data.errors_.length < 1;
        }

        let sectionErrors = [];
        if ( data$errors_ ) {
          sectionErrors = data$errors_.filter(error =>
            this.section.properties.includes(error[0])
          );
        }
        return ! sectionErrors.length > 0;
      }
    },
    {
      name: 'customView',
      class: 'foam.u2.ViewSpec',
      documentation: `
        A view to display for this section. If the 'section' property is set,
        this property will override it.
      `
    },
    {
      name: 'navTitle',
      class: 'String',
      documentation: 'Short title used for navigation menu items',
      expression: function(section) {
        return section && section.navTitle;
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: null
    }
  ],

  methods: [
    function createView(opt_spec, opt_ctx_extras) {
      if ( ! opt_spec ) opt_spec = {};
       // to do: look into why we need wizardlet's subcontext to render the view
      var ctx = this.wizardlet.__subSubContext__.createSubContext({
        wizardController: this.wizardlet.wizardController ||
          this.wizardlet.__subContext__.wizardController
      });

      if ( opt_ctx_extras ) {
        ctx = ctx.createSubContext(opt_ctx_extras);
      }

      ctx.analyticsAgent?.pub('event', {
        name: 'VIEW_LOAD_' + this.wizardlet.id
      });

      if ( this.customView ) {
        return this.ViewSpec.createView(
          this.customView, { data$: this.wizardlet.data$ }, this, ctx);
      }

      ctx.register(
        this.VerticalDetailView,
        'foam.u2.detail.SectionedDetailView'
      );

      // try local setting and wizard-global setting
      // otherwise, we use default from the SectionView
      var showTitle = null;
      if ( this.showTitle != null ) showTitle = this.showTitle;
      else if ( this.showWizardletSectionTitles != null ) showTitle = this.showWizardletSectionTitles;

      return this.ViewSpec.createView(this.section.view,
        { 
          section: this.section,
          data$: this.wizardlet.data$,
          of$: this.wizardlet.data$.map(d => d.cls_),
          ...opt_spec,
          // ...(showTitle != null ? { showTitle: showTitle } : {})
          // this line is equivalent to commented code above
          ...(showTitle != null ? { showTitle } : {})
        }, this, ctx);
    }
  ]
});
