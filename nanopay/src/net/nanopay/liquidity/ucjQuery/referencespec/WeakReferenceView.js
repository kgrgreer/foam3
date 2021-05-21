/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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

        var updateDAO = () => {
          if ( !! propValue.dao ) {
            this.choiceView.dao = propValue.dao;
          } else if ( !! propValue.targetDAOKey ) {
            this.choiceView.dao = this.ctrl.__subContext__[propValue.targetDAOKey];
          }
        };

        updateDAO();

        this.onDetach(propValue.targetDAOKey$.sub(updateDAO));
        this.onDetach(propValue.dao$.sub(updateDAO));
      }
    },
    function initE() {
      var self = this;
      console.log(self.choiceView);
      self.add(self.choiceView);
    }
  ]
});
