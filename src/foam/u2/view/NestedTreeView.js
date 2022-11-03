/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/


foam.CLASS({
  package: 'foam.u2.view',
  name: 'TreeViewHeading',
  extends: 'foam.u2.view.TreeViewRow',
  css: `
    ^select-level {
      justify-content: flex-start;
      gap: 8px;
    }
  `,
  methods: [
    function render() {
      var self = this;
      var labelString = this.data.label;
      if ( this.translationService ) {
        labelString = self.translationService.getTranslation(foam.locale, self.data.label, self.data.label);
      }
      var mainLabel = this.E().
        addClass(self.myClass('select-level')).
        start(this.Image, { glyph: 'next' }).
        addClass(self.myClass('toggle-icon')).
        style({ 'transform': 'rotate(180deg)' }).
        end().
        callIfElse(self.rowConfig?.[this.data.id], 
          function() {
            this.tag(self.rowConfig[self.data.id]);
          },
          function() {
            this.start().
              addClass('p-semiBold').
              addClass(self.myClass('label')).
              call(self.formatter, [self.data]).
            end();
          }
        );
      this.
        addClass(this.myClass()).
        enableClass(this.myClass('selected'), this.selected_$).
        callIf(this.draggable, function() {
          this.
          attrs({ draggable: 'true' }).
          on('dragstart', this.onDragStart).
          on('dragenter', this.onDragOver).
          on('dragover',  this.onDragOver).
          on('drop',      this.onDrop);
        }).
        start().
          addClass(self.myClass('heading')).
          style({
            'padding-left': ((( self.level - 1) * 16 ) + 'px')
          }).
          startContext({ data: self }).
            start(self.ON_CLICK_FUNCTIONS, {
              buttonStyle: 'UNSTYLED',
              label: mainLabel,
              ariaLabel: labelString,
              size: 'SMALL'
            }).
              enableClass('selected', this.selected_$).
              addClass(this.myClass('button')).
            end().
          endContext().
        end();
    }
  ]
});



foam.CLASS({
  package: 'foam.u2.view',
  name: 'NestedTreeView',
  extends: 'foam.u2.view.TreeView',

  requires: [
    'foam.mlang.ExpressionsSingleton',
    'foam.u2.view.TreeViewRow',
    'foam.u2.view.TreeViewHeading'
  ],

  properties: [
    { name: 'currentRootStack', class: 'Array'  },
    'currentRoot'
  ],

  methods: [
    function render() {
      this.startExpanded = this.startExpanded;

      var of  = this.__context__.lookup(this.relationship.sourceModel);
      var self = this;
      var isFirstSet = false;

      this.addClass().
        add(this.slot(function(currentRoot) {
          var dao = this.data$proxy.where(
            this.EQ(of.getAxiomByName(this.relationship.inverseName), currentRoot || this.defaultRoot));
          return this.E()
          .callIf(currentRoot, function() { 
            this
              .startContext({ data: self })
                .tag(self.TreeViewHeading, {
                  data:         currentRoot,
                  relationship: self.relationship,
                  expanded:     self.startExpanded,
                  formatter:    self.formatter,
                  query:        self.query,
                  onClickAddOn: self.back,
                  level:        1
                })
              .end()
          })
          .select(dao, function(obj) {
            if ( ! isFirstSet && ! self.selection ) {
              self.selection = obj;
              isFirstSet = true;
            }
            return self.TreeViewRow.create({
              data:         obj,
              relationship: self.relationship,
              expanded:     self.startExpanded,
              formatter:    self.formatter,
              query:        self.query,
              onClickAddOn: self.onClickAddOn1,
              level:        1
            }, this);
          });
        }));
    }
  ],
  listeners: [
    function onClickAddOn1(obj, hasChildren) {
      this.onClickAddOn(obj, hasChildren);
      if ( hasChildren ) {
        this.currentRootStack$push(obj);
        this.currentRoot = this.currentRootStack?.[this.currentRootStack.length-1]
      }
    },
    function back() {
      this.currentRootStack.pop();
      this.currentRoot = this.currentRootStack?.[this.currentRootStack.length-1]
    }
  ]
});
