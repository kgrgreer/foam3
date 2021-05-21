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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'IsPubliclyTradedQuestion',
  documentation: `
    This model is the question a business must answer in the case it has 0 beneficial owners
  `,

  imports: [
    'subject'
  ],

  sections: [
    {
      name: 'publiclyTradedQuestionSection',
      title: 'Is this a publicly traded company?'
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'publiclyTraded',
      section: 'publiclyTradedQuestionSection',
      documentation: 'Whether this is a publicly traded company.',
      label: 'This is a publicly traded company'
    }
  ]
});