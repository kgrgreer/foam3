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
  name: 'CurrencyAmountInfor',

  documentation: ``,

  sections: [
    {
      name: 'businessCapital',
      title: 'Business Capital and Business Equity'
    }
  ],

  properties: [
    {
      section: 'businessCapital',
      class: 'Long',
      name: 'capital',
      required: true,
      label:'Business Capital',
      documentation: 'Amount currency that Business Capital has been defined',
      required: true
    },
    {
      section: 'businessCapital',
      class: 'Long',
      name: 'equity',
      required: true,
      label:'Business Equity',
      documentation: 'Amount currency that Business Equity has been defined',
      required: true
    },
  ],
});

