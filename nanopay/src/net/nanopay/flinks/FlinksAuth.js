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

foam.INTERFACE({
  package: 'net.nanopay.flinks',
  name: 'FlinksAuth',

  methods: [
  {
    name: 'authorize',
    type: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException'],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'institution',
        type: 'String'
      },
      {
        name: 'username',
        type: 'String'
      },
      {
        name: 'password',
        type: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  },
  {
    name: 'challengeQuestion',
    type: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'institution',
        type: 'String'
      },
      {
        name: 'username',
        type: 'String'
      },
      {
        name: 'requestId',
        type: 'String'
      },
      {
        name: 'map1',
        type: 'Map'
      },
      {
        name: 'type',
        type: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  },
  {
    name: 'getAccountSummary',
    type: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'requestId',
        type: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      },
      {
        type: 'Boolean',
        name: 'keepOnlyCADAccounts'
      }
    ]
  },
  {
    name: 'pollAsync',
    type: 'net.nanopay.flinks.model.FlinksResponse',
    async: true,
    javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'requestId',
        type: 'String'
      },
      {
        type: 'foam.nanos.auth.User',
        name: 'currentUser'
      }
    ]
  }
  ]
 });
