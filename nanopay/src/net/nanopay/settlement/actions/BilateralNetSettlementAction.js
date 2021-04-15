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
  package: 'net.nanopay.settlement.actions',
  name: 'BilateralNetSettlementAction',

  documentation: `
    Under CB, to settle the balances of direct clearers using a Bilateral Net method. 
    
    Bilateral netting is when two parties combine all their balances into one 
    master balance, creating one net payment, instead of many, between the parties.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TODO: Going to rework transactions for CB
      `
    }
  ]
});
