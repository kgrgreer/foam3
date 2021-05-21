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

// TODO: almost a direct copy of ReadReferenceView - need to DRY it
foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery.referencespec',
  name: 'ReadWeakReferenceView',
  extends: 'foam.u2.View',

  documentation: 'A read-only view for a Reference Property.',

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.detail.SectionedDetailView',
    'foam.u2.CitationView'
  ],

  properties: [
    'obj',
    'propValue'
  ],

  imports: [
    'ctrl',
    'stack'
  ],

  methods: [
    {
      name: 'initE',
      code: function() {
        var self = this;
        this.SUPER();
        this
          .start('a')
            .attrs({ href: '#' })
            .on('click', function(evt) {
              evt.preventDefault();
              self.stack.push({
                class: 'foam.comics.v2.DAOSummaryView',
                data: self.obj,
                of: self.obj.cls_,
                config: self.DAOControllerConfig.create({
                  daoKey$: self.data$.dot('targetDAOKey')
                })
              }, self);
            })
            .tag(this.CitationView, { data$: this.obj$ })
          .end();
      }
    },

    function fromProperty(prop) {
      this.SUPER(prop);

      var propValue = this.data;

      propValue.target = "Transaction Create on Scheduled Invoices"
      prop.targetDAOKey = "cronDAO";
      window.propValue = propValue;

      var ableToSetDAO =
        typeof propValue === 'object' &&
        foam.core.FObject.isInstance(propValue) &&
        propValue.targetDAOKey$ !== undefined
        ;
      var self = this;
      console.log(propValue.targetDAOKey);
      var dao = self.__context__[propValue.targetDAOKey];
      dao.find(propValue.target).then((o) => this.obj = o);
    }
  ]
});
