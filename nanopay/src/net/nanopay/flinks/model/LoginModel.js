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

//instance when Http status code is 200
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'LoginModel',

  documentation: 'model for Flinks Login',

  properties: [
    {
      class: 'String',
      name: 'Username',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'IsScheduledRefresh',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'LastRefresh',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'Type',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'Id',
      visibility: 'RO'
    }
  ]
});
