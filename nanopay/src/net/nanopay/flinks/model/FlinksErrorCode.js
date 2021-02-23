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

foam.ENUM({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksErrorCode',

  documentation: 'Flinks error code',

  values: [
    {
      name: 'INVALID_LOGIN',
      label: 'INVALID LOGIN'
    },
    {
      name: 'INVALID_USERNAME',
      label: 'INVALID USERNAME'
    },
    {
      name: 'INVALID_PASSWORD',
      label: 'INVALID PASSWORD'
    },
    {
      name: 'INVALID_SECURITY_RESPONSE',
      label: 'INVALID SECURITY RESPONSE'
    },
    {
      name: 'QUESTION_NOT_FOUND',
      label: 'QUESTION NOT FOUND'
    },
    {
      name: 'UNKNOWN_CHALLENGE_KEY',
      label: 'UNKNOWN CHALLENGE KEY'
    },
    {
      name: 'SECURITYRESPONSES_INCOMPLETE',
      label: 'SECURITYRESPONSES INCOMPLETE'
    },
    {
      name: 'AGGREGATION_ERROR',
      label: 'AGGREGATION ERROR'
    },
    {
      name: 'DISABLED_INSTITUTION',
      label: 'DISABLED INSTITUTION'
    },
    {
      name: 'RETRY_LATER',
      label: 'RETRY LATER'
    },
    {
      name: 'INVALID_REQUEST',
      label: 'INVALID REQUEST'
    },
    {
      name: 'OPERATION_DISPATCHED',
      label: 'OPERATION DISPATCHED'
    },
    {
      name: 'OPERATION_PENDING',
      label: 'OPERATION PENDING'
    },
    {
      name: 'CONCURRENT_SESSION',
      label: 'CONCURRENT SESSION'
    },
    {
      name: 'UNAUTHORIZED',
      label: 'UNAUTHORIZED'
    },
    {
      name: 'SESSION_NONEXISTENT',
      label: 'SESSION NONEXISTENT'
    },
    {
      name: 'DISABLED_LOGIN',
      label: 'DISABLED LOGIN'
    },
    {
      name: 'NEW_ACCOUNT',
      label: 'NEW ACCOUNT'
    },
    {
      name: 'TOO_MANY_REQUESTS',
      label: 'TOO MANY REQUESTS'
    },

  ]
})