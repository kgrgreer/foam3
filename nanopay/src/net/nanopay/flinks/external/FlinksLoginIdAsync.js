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
  package: 'net.nanopay.flinks.external',
  name: 'FlinksLoginIdAsync',
  extends: 'net.nanopay.flinks.external.FlinksLoginIdRequest',

  properties: [
    {
      name: 'id',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'requestId',
      documentation: 'Request ID for querying Flinks result'
    },
    {
      class: 'String',
      name: 'status',
      documentation: 'Status of FlinksLoginId call'
    },
    {
      class: 'FObjectProperty',
      name: 'flinksLoginIdResult',
      documentation: 'Flinks LoginId result',
      of: 'net.nanopay.flinks.external.FlinksLoginId'
    },
    {
      class: 'String',
      name: 'errorMessage',
      documentation: 'Any Flinks LoginId error messages.'
    },
    {
      class: 'FObjectProperty',
      name: 'exception',
      of: 'foam.core.FOAMException'
    }
  ]
});
