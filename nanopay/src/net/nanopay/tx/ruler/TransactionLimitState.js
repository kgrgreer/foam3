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
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitState',
  documentation: `
    This class stores the transaction limit and date when that limit was set.
    Responsible for updating the limit as well.`,

  javaImports: [
    'net.nanopay.util.Frequency'
  ],

  properties: [
    {
      class: 'Long',
      name: 'lastActivity',
      value: 0
    },
    {
      class: 'Long',
      name: 'spent'
    }
  ],

  methods: [
    {
      name: 'update',
      args: [
        {
          name: 'limit',
          type: 'Long'
        },
        {
          name: 'period',
          type: 'net.nanopay.util.Frequency'
        }
      ],
      javaCode: `
      long now   = System.currentTimeMillis();
      long delta = getLastActivity() != 0 ? now - getLastActivity() : 0;

      setLastActivity(now);
      setSpent(Math.max(getSpent() - delta * limit / period.getMs(), 0));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`

        public synchronized boolean check(Long limit, net.nanopay.util.Frequency period, Long amount) {
          update(limit, period);

          if ( amount <= limit - getSpent() ) {
            return true;
          }
          return false;
        }

        public synchronized void updateSpent(Long amount, Frequency period) {
          setSpent((period == Frequency.PER_TRANSACTION) ? 0 : Math.max(0, getSpent() + amount));
        }
        `);
      }
    }
  ]
});
