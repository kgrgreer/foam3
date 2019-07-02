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
