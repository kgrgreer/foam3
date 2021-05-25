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

// TODO: make clearingTimes property storage transient as it could be re-generated
// via probing assuming the applicable rules for the transaction are un-changed.
//
// Eg.,
//
//    RulerProbe probe = new RulerProbe();
//    probe.setObject(transaction);
//    probe.setOperation(Operations.UPDATE);
//    probe = (RulerProbe) transactionDAO.cmd(probe);
//
// Currently it doesn't work on the transactions already sit in SENT status
// because the predicate of clearing time rules checks for changes on status (to
// SENT) instead of the value of the status property itself.

foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTimeTransactionRefinement',
  refines: 'net.nanopay.tx.ClearingTimeTransaction',

  implements: [
    'net.nanopay.meter.clearing.ClearingTimesTrait'
  ],

  properties: [
    {
      name: 'clearingTimes',
      javaFactory: 'return new java.util.HashMap<>();',
      section: 'systemInformation',
      order: 100
    },
    {
      name: 'estimatedCompletionDate',
      javaFactory: 'return null;',
      section: 'systemInformation',
      order: 90,
      gridColumns: 6
    },
    {
      name: 'processDate',
      javaFactory: 'return null;',
      section: 'systemInformation',
      order: 80,
      gridColumns: 6
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'VerificationTransactionRefinement',
  refines: 'net.nanopay.tx.cico.VerificationTransaction',

  implements: [
    'net.nanopay.meter.clearing.ClearingTimesTrait'
  ],

  properties: [
    {
      name: 'clearingTimes',
      javaFactory: 'return new java.util.HashMap<>();'
    },
    {
      name: 'estimatedCompletionDate',
      javaFactory: 'return null;'
    },
    {
      name: 'processDate',
      javaFactory: 'return null;'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'AscendantFXTransactionRefinement',
  refines: 'net.nanopay.fx.ascendantfx.AscendantFXTransaction',

  implements: [
    'net.nanopay.meter.clearing.ClearingTimesTrait'
  ],

  properties: [
    {
      name: 'clearingTimes',
      javaFactory: 'return new java.util.HashMap<>();'
    },
    {
      name: 'estimatedCompletionDate',
      javaFactory: 'return null;'
    },
    {
      name: 'processDate',
      javaFactory: 'return null;'
    }
  ]
});
