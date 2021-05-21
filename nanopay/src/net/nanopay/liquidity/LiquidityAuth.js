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

foam.INTERFACE({
  package: 'net.nanopay.liquidity',
  name: 'LiquidityAuth',

  methods: [
    {
      name: 'liquifyAccount',
      args: [
        {
          name: 'accountId',
          type: 'String'
        },
        {
          name: 'frequency',
          type: 'net.nanopay.util.Frequency'
        },
        {
          // helps determine if account balance went out of the range for the first time.
          name: 'txnAmount',
          type: 'Long'
        }
      ]
    },
    {
      name: 'liquifyFrequency',
      args: [
        {
          name: 'frequency',
          type: 'net.nanopay.util.Frequency'
        }
      ]
    }
  ]
});
