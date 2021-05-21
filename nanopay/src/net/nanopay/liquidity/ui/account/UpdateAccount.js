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
  package: 'net.nanopay.liquidity.ui.account',
  name: 'UpdateAccount',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.DetailView'
  ],
  imports: [
    'selection as data'
  ],
  exports: [
    'data'
  ],
  classes: [
    {
      name: 'ViewModel',
      requires: [
        'net.nanopay.liquidity.ui.account.Balance',
        'net.nanopay.liquidity.ui.account.Overview',
        'net.nanopay.liquidity.ui.account.ThresholdRules'
      ],
      imports: [
        'transactionDAO'
      ],
      properties: [
        {
          class: 'FObjectProperty',
          name: 'balance',
          factory: function() {
             return this.Balance.create();
          }
        },
        {
          class: 'FObjectProperty',
          name: 'overview',
          factory: function() {
             return this.Overview.create();
          }
        },
        {
          class: 'FObjectProperty',
          name: 'thresholdRules',
          factory: function() {
             return this.ThresholdRules.create();
          }
        },
        {
          class: 'foam.dao.DAOProperty',
          name: 'recentTransactions',
          factory: function() {
             return this.transactionDAO;
          }
        }
      ],
      actions: [
        {
          name: 'newTransfer',
          code: function() {
            alert('todo');
          }
        }
      ]
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.tag(this.DetailView, { data: this.ViewModel.create() });
    }
  ]
});
