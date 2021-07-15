/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'CardSelectionView',
  extends: 'foam.u2.View',
  flags: ['web'],

  documentation: `A card selection view where the data is presented in a CardSelectView,
  a simpler version of the MultiChoiceView where the user must choose only one card`,

  implements: [ 'foam.mlang.Expressions' ],

  requires: [ 'foam.u2.view.CardSelectView' ],

  css: `
    ^flexer {
      flex-wrap: wrap;
    }
    ^innerFlexer {
      display: inline-flex;
      padding: 4px;
      box-sizing: border-box;
    }
  `,

  properties: [
    {
      name: 'choices',
      factory: function() {
        return [];
      }
    },
    [ 'isVertical', true],
    {
      class: 'Int',
      name: 'numCols',
      value: 2,
      documentation: `
        Used to control the number of cards shown in a row if isVertical is false
      `
    }
  ],

  methods: [
    function render() {
      var self = this;
      this
        .start(this.isVertical ? foam.u2.layout.Rows : foam.u2.layout.Cols)
          .addClass(this.myClass('flexer'))
          .add(
            self.slot(function(choices) {
              var toRender = choices.sort().map((choice, index) => {
                var valueSimpSlot = self.mustSlot(choice);
                var isSelectedSlot = self.slot(function(choices, data) {
                  return self.choiceIsSelected(data, choices[index]);
                });

                return self.E()
                  .addClass(self.myClass('innerFlexer'))
                  .style({
                    'width': self.isVertical ? '100%' : `${100 / self.numCols}%`
                  })
                  .start(self.CardSelectView, {
                    data$: valueSimpSlot,
                    isSelected$: isSelectedSlot,
                    of: choice.cls_.id
                  })
                    .call(function () {
                      self.E().onDetach(
                        this.clicked.sub(() => {
                          self.data =  ! self.choiceIsSelected(self.data, valueSimpSlot.get()) ?
                            valueSimpSlot.get() :
                            null;
                        }),
                        this.selectionDisabled.sub(() => {
                          if ( self.isDisabled && self.choiceIsSelected(self.data, valueSimpSlot.get()) ) {
                            self.clearProperty('data');
                          }
                        })
                      )
                    })
                  .end()

              });
              return toRender;
            })
          )
        .end();
    },

    function choiceIsSelected(data, choice) {
      return foam.util.equals(data, choice);
    },

    function mustSlot(v) {
      return foam.core.Slot.isInstance(v) ?
        v :
        foam.core.SimpleSlot.create({ value: v });
    }
  ]
});
