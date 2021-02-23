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
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'IdentityMindResponseEDNA',
  documentation: `
    The model for representing the IdentityMind Response eDNA Score Card
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.identityMind.AutomatedReviewEngineResult',
      name: 'ar',
      label: 'Automated Review Engine Result'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.identityMind.ExternalizedEvaluationResult',
      name: 'er',
      label: 'Externalized Evaluation',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.identityMind.ConditionResult',
      name: 'etr',
      label: 'Evaluated Test Results',
      view: 'foam.u2.view.FObjectArrayTableView'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.identityMind.ConditionResult',
      name: 'sc',
      label: 'Test Results',
      view: 'foam.u2.view.FObjectArrayTableView'
    }
  ]

});
