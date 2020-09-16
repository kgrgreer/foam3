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
  package: 'net.nanopay.crunch.registration',
  name: 'NamedBusiness',
  abstract: true,

  properties: [
    net.nanopay.model.Business.BUSINESS_NAME.clone().copyFrom(),
    
    // Question: does this affect the copying to the business record?
    {
      class: 'Reference',
      name: 'business',
      targetDAOKey: 'businessDAO',
      of: 'net.nanopay.model.Business',
      documentation: 'Associated business'
    }
  ]
});
