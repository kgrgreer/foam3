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
  package: 'net.nanopay.model',
  name: 'BusinessDirector',

  documentation: `
    A business director is a person from a group of managers who leads or
    supervises a particular area of a company.
  `,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      gridColumns: 6,
      minLength: 1
    },
    {
      class: 'String',
      name: 'lastName',
      gridColumns: 6,
      minLength: 1
    }
  ]
});
