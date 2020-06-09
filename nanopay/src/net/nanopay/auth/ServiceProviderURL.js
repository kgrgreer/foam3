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

/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ServiceProviderURL',

  documentation: 'Configure ServiceProvider to apply on User Create based on AppConfig URL',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'spid',
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      required: true
    },
    {
      name: 'urls',
      class: 'StringArray',
      documentation: 'Array of urls to enforce this spid on',
      factory: function() {
        return [];
      },
      javaFactory: 'return new String[0];',
      required: true
    },
  ]
});
