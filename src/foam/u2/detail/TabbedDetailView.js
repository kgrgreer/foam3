/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'TabbedDetailView',
  extends: 'foam.u2.detail.AbstractSectionedDetailView',
  mixins: ['foam.nanos.controller.MementoMixin'],

  requires: [
    'foam.core.ArraySlot',
    'foam.nanos.controller.Memento',
    'foam.u2.borders.CardBorder',
    'foam.u2.detail.SectionView',
    'foam.u2.Tab',
    'foam.u2.Tabs'
  ],

  css: `
    ^ .foam-u2-Tabs-content > div {
      background: white;
      padding: 14px 16px;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    ^ .foam-u2-view-ScrollTableView table {
      width: 100%;
    }

    ^ .foam-u2-Tabs-tabRow {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    ^wrapper {
      padding: 14px 24px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'defaultSectionLabel',
      value: 'Uncategorized'
    },
    'tabs'
  ],

  methods: [
    function render() {
      var self = this;

      this.currentMemento_ = this.memento;

      this.SUPER();
      this
        .addClass(this.myClass())
        .add(this.slot(function(sections, data) {
          if ( ! data ) return;

          var arraySlot = foam.core.ArraySlot.create({
            slots: sections.map((s) => s.createIsAvailableFor(self.data$, self.__subContext__.controllerMode$))
          });

          return self.E()
            .add(arraySlot.map(visibilities => {
              var availableSections = visibilities.length == sections.length ? sections.filter((_, i) => visibilities[i]) : sections;
              var e = availableSections.length == 1 ?
                this.E().start(self.CardBorder).addClass(self.myClass('wrapper'))
                  .tag(self.SectionView, { data$: self.data$, section: availableSections[0], showTitle: false })
                .end() :
                this.E()
                .start(self.Tabs, {}, self.tabs$)
                  .forEach(availableSections, function(s) {
                    if ( s.title ) {
                      var title$ = foam.Function.isInstance(s.title) ?
                        foam.core.ExpressionSlot.create({
                          obj: self.data,
                          code: s.title
                        }) :
                        s.title$;

                      var tab = foam.core.SimpleSlot.create();
                      this
                        .start(self.Tab, { label$: title$ || self.defaultSectionLabel, selected: self.memento && self.memento.head === s.title }, tab)
                         .call(function() {
                           this.tag(self.SectionView, {
                             data$: self.data$,
                             section: s,
                             showTitle: false,
                             selected$: tab.value.selected$
                           });
                         })
                       .end();
                    }
                  })
                .end();
              self.tabs && ( self.tabs.updateMemento = true );
              return e;
            }));
        }));
    }
  ]
});
