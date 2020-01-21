/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery.referencespec',
  name: 'WeakReferenceView',
  extends: 'foam.u2.View',

  imports: [
    'ctrl'
  ],

  requires: [
    'foam.u2.view.ChoiceView'
  ],

  properties: [
    {
      name: 'choice',
      postSet: function (_, nu) {
        this.data.target = nu;
      }
    },
    {
      name: 'choiceView',
      factory: function () {
        return this.ChoiceView.create({
          data$: this.data$.dot('target'),
          objToChoice: function (obj) {
            return [ obj.id, obj.toSummary() ];
          },
          placeholder: '--'
        });
      }
    }
  ],

  methods: [
    function fromProperty(prop) {
      this.SUPER(prop);

      var propValue = this.data;
      window.propValue = propValue;

      var needToSetDAO = ! this.choiceView.dao;
      var ableToSetDAO =
        typeof propValue === 'object' &&
        foam.core.FObject.isInstance(propValue) &&
        propValue.targetDAOKey$ !== undefined
        ;
      if ( needToSetDAO ) {
        if ( ! ableToSetDAO ) {
          debugger;
          throw new Error('unable to set DAO for WeakReferenceView');
        }

        var self = this;

        var updateDAO = () => {
          if ( !! propValue.dao ) {
            self.choiceView.dao = propValue.dao;
          } else if ( !! propValue.targetDAOKey ) {
            self.choiceView.dao = self.ctrl.__subContext__[propValue.targetDAOKey];
          }
        };

        updateDAO();

        propValue.targetDAOKey$.sub(function () {
          updateDAO();
        });

        propValue.dao$.sub(function () {
          updateDAO();
        });
      }
    },
    function initE() {
      var self = this;
      console.log(self.choiceView);
      self.add(self.choiceView);
    }
  ]
});
