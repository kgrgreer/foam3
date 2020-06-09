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
  package: 'net.nanopay.onboarding.model',
  name: 'Questionnaire',

  documentation: 'Describes a number of questions as a whole',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the questionnaire'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.onboarding.model.Question',
      name: 'questions',
      documentation: 'Questions associated to questionaire.',
    }
  ]
});
