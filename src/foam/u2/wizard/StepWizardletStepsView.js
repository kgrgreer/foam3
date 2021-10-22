/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'WizardletRenderUtils',

  methods: [
    function calculateWizardletDisplayNumber(w, list) {
      // Since wizardlet visibility is dynamic it is not possible to
      // get the correct number without first checking how many invisible
      // wizardlets exist along the waay.
      var wSkipped = 0;
      var i;
      for ( i = 0; i < list.length && list[i] != w; i++ ) {
        if ( ! list[i].isAvailable || ! list[i].isVisible ) {
          wSkipped++;
        }
      }
      return i + 1 - wSkipped;
    },
    function configureIndicator(wizardlet, isCurrent, number) {
      var args = {
        size: 24, borderThickness: 2,
      };
      if ( wizardlet.indicator == this.WizardletIndicator.COMPLETED ) {
        args = {
          ...args,
          borderColor: this.theme.approval3,
          backgroundColor: this.theme.approval3,
          borderColorHover: this.theme.approval3,
          icon: this.theme.glyphs.checkmark.getDataUrl({
            fill: this.theme.white
          }),
        };
      } else if (
        wizardlet.indicator == this.WizardletIndicator.SAVING ||
        wizardlet.indicator == this.WizardletIndicator.NETWORK_FAILURE
      ) {
        args = {
          ...args,
          indicateProcessing: true,
          borderColor: 'rgba(0,0,0,0)',
          borderColorHover: 'rgba(0,0,0,0)',
          label: '' + number
        };
      } else {
        args = {
          ...args,
          borderColor: this.theme.grey2,
          borderColorHover: this.theme.grey2,
          label: '' + number
        };
      }
      if ( isCurrent ) {
        args = {
          ...args,
          borderColor: this.theme.black,
          borderColorHover: this.theme.black
        };
      }
      return args;
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletStepsView',
  extends: 'foam.u2.View',
  mixins: ['foam.u2.wizard.WizardletRenderUtils'],

  css: `
    ^item {
      margin-bottom: 24px;
    }
    ^step-number-and-title {
      display: flex;
      align-items: center;
    }
    ^step-number-and-title > .circle {
      display: inline-block;
      margin-right: 24px;
      vertical-align: middle;
      min-width: 24px;
    }
    ^sub-item {
      padding-left: calc(24px + 24px + 4px);
      padding-top: 2px;
      padding-bottom: 8px;
      color: /*%GREY2%*/ #9ba1a6;
    }
    ^sub-item:hover {
      cursor: pointer;
      color: /*%GREY1%*/ #5e6061 !important;
    }
    ^sub-item:first-child {
      padding-top: 16px;
    }
    ^title {
      display: inline-block;
      margin: 0;
      vertical-align: middle;
      text-transform: uppercase;
    }

    ^ .foam-u2-LoadingSpinner img {
      width: 24px;
      height: 24px;
    }

    ^hide {
      opacity: 0.3;
    }

    ^search{
      padding-bottom: 32px;
    }

    ^search input{
      width: 100%;
    }
  `,

  imports: [
    'theme'
  ],

  requires: [
    'foam.core.ExpressionSlot',
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.tag.CircleIndicator',
    'foam.u2.wizard.WizardPosition',
    'foam.u2.wizard.WizardletIndicator',
    'foam.u2.wizard.WizardletSearchController'
  ],

  messages: [
    { name: 'PART_LABEL', message: 'Part ' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.WizardletSearchController',
      name: 'searchController'
    },
    {
      class: 'Array',
      name: 'stepElements'
    }
  ],

  methods: [
    function render() {
      var self = this;
      this.searchController = this.WizardletSearchController.create({
        wizardlets$: this.data.wizardlets$
      });
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('search'))
          .tag(foam.u2.SearchField, {
            data$: this.searchController.data$,
            onKey: true
          })
        .end()
        .add(this.slot(function (
          data$wizardlets,
          data$wizardPosition,
          data$availabilityInvalidate
        ) {
          let elem = this.E();

          let afterCurrent = false;

          this.stepElements = [];
          for ( let w = 0 ; w < data$wizardlets.length ; w++ ) {
            let wizardlet = this.data.wizardlets[w];
            let isCurrent = wizardlet === this.data.currentWizardlet;

            if (
              this.data.countAvailableSections(w) < 1
              || ! wizardlet.isAvailable
              || ! wizardlet.isVisible
            ) {
              continue;
            }

            elem = elem
              .start()
                .call(function () { self.stepElements.push(this) })
                .setAttribute('data-wizardlet', wizardlet.id)
                .addClass(self.myClass('item'))
                .addClass(wizardlet.isHidden$.map(v => v && self.myClass('hide')))
                .add(this.ExpressionSlot.create({
                  args: [wizardlet.indicator$],
                  code: () => {
                    return self.E()
                      .addClass(self.myClass('step-number-and-title'))

                      // Render circle indicator
                      .start(this.CircleIndicator, this.configureIndicator(
                        wizardlet, isCurrent,
                        this.calculateWizardletDisplayNumber(
                          wizardlet, data$wizardlets)
                      ))
                        .addClass('circle')
                      .end()

                      // Render title
                      .start('p').addClass(self.myClass('title'))
                        .translate(wizardlet.capability.id+'.name', wizardlet.capability.name)
                        .style({
                          'color': isCurrent ? this.theme.black : this.theme.grey2
                        })
                      .end()
                      ;
                  }
                }))
                .start()
                .end();

            // Get section index to highlight current section
            let wi = data$wizardPosition.wizardletIndex;
            let si = data$wizardPosition.sectionIndex;

            // Render section labels
            let sections = this.data.wizardlets[w].sections;

            for ( let s = 0 ; s < sections.length ; s++ ) {
              let pos = this.WizardPosition.create({
                wizardletIndex: w,
                sectionIndex: s,
              })
              let section = sections[s];
              let isCurrentSection = isCurrent && si === s;
              let isBeforeCurrentSection = w < wi || isCurrent && s < si;

              let allowedToSkip = self.data.canSkipTo(pos);
              let slot = section.isAvailable$.map(function (isAvailable) {
                return isAvailable ? self.renderSectionLabel(
                  self.E().addClass(self.myClass('sub-item')),
                  section, s+1,
                  isCurrentSection
                ).on('click', () => {
                  if ( isCurrentSection ) return;
                  if ( allowedToSkip ) {
                    self.data.skipTo(pos);
                  }
                  return;
                }) : self.E('span');
              })
              elem.add(slot);
            }

            elem = elem
              .end();

            if ( isCurrent ) afterCurrent = true;
          }

          elem.onload.sub(self.setScrollPos);
          return elem;
        }))
    },
    function renderSectionLabel(elem, section, index, isCurrent) {
      let title = section.title;
      if ( ! title || ! foam.Function.isInstance(title) && ! title.trim() ) title = this.PART_LABEL + index;

      title = foam.Function.isInstance(title) ?
      foam.core.ExpressionSlot.create({
        obj$: section.data$,
        code: title
      }) : title;

      return elem
        .style({
          'color': isCurrent
            ? this.theme.black
            : this.theme.grey2
        })
        .translate(title, title);
    },
  ],

  listeners: [
    {
      name: 'setScrollPos',
      isFramed: true,
      code: async function() {
        var el    = await this.parentNode.el();

        var currChild = null;
        for ( let node of this.stepElements ) {
          if ( node.getAttribute('data-wizardlet') == this.data.currentWizardlet.id ) {
            currChild = node;
            break;
          }
        }
        var firstChild = await this.childNodes[0].childNodes[0].el();
        currChild = await currChild.el();

        var padding    = firstChild.offsetTop;
        var scrollTop  = currChild.offsetTop;
        el.scrollTop   = scrollTop - padding;
      }
    }
  ]
});
