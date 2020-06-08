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

  sections: [
    {
      name: 'automatedReview',
      title: 'Automated Review Engine Result',
      help: `The result of the automated review policy for this transaction.`
    },
    {
      name: 'evaluatedTestResults',
      title: 'Evaluated Test Results',
      help: `The evaluated test results for this transaction.`
    },
    {
      name: 'testResults',
      title: 'Test Results',
      help: `The test results for this transaction.`
    },
    {
      name: 'externalizedEvaluation',
      title: 'Externalized Evaluation',
      help: `The result of the fraud policy evaluation for this transaction.`
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.identityMind.AutomatedReviewEngineResult',
      name: 'ar',
      section: 'automatedReview'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.identityMind.ConditionResult',
      name: 'etr',
      section: 'evaluatedTestResults',
      view: 'foam.u2.view.FObjectArrayTableView'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.identityMind.ConditionResult',
      name: 'sc',
      section: 'testResults',
      view: 'foam.u2.view.FObjectArrayTableView'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.identityMind.ExternalizedEvaluationResult',
      name: 'er',
      section: 'externalizedEvaluation'
    }
  ]

});
