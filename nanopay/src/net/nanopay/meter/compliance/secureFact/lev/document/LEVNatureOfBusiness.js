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
  package: 'net.nanopay.meter.compliance.secureFact.lev.document',
  name: 'LEVNatureOfBusiness',
  documentation: 'The nature of business, as reported on the profile',

  properties: [
    {
      class: 'String',
      name: 'codeType',
      documentation: 'The name of the standardized nature of business code, for example, NAICS.'
    },
    {
      class: 'String',
      name: 'codeValue',
      documentation: 'The code value assigned as the nature of business, based on the codeType.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'A text description of the nature of business of the entity.'
    }
  ]
});
