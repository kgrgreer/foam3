// TODO: Going to be reworked

/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.settlement',
  name: 'SettlementAccountBalanceComparator',

  javaImplements: [ 'java.util.Comparator' ],
  
  methods: [
    {
      name: 'compare',
      type: 'Integer',
      args: [
        {
          name: 'o1',
          type: 'Any'
        },
        {
          name: 'o2',
          type: 'Any'
        }
      ],
      javaCode: `
        if ( o1 instanceof SettlementAccount &&  o2 instanceof SettlementAccount ) {
          SettlementAccount account1 = (SettlementAccount) o1;
          SettlementAccount account2 = (SettlementAccount) o2;
          return Long.compare((long) account1.findBalance(getX()), (long) account2.findBalance(getX()));
        }
        return 0;
      `
    },
  ]
});
  