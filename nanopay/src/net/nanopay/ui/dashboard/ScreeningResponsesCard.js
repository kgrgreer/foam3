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

foam.CLASS({
  package: 'net.nanopay.ui.dashboard',
  name: 'ScreeningResponsesCard',
  extends: 'foam.dashboard.view.Dashboard',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dashboard.model.GroupBy',
    'foam.dashboard.model.VisualizationSize',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.ui.dashboard.TransactionDateRangeView'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .tag(this.GroupBy.create({
          configView: null,
          currentView: { class: 'foam.dashboard.view.Table', citationView: 'net.nanopay.ui.dashboard.ScreeningResponseCitationView',
            listDAOName: 'userDAO', searchKey: foam.nanos.auth.User.GROUP },
          dao: this.__subContext__['counterDAO'],
          predicate: 'name=screening_response',
          arg1: 'key',
          size: this.VisualizationSize.SMALL,
          label: 'Screening Responses'
        }))
    }
  ]
});

