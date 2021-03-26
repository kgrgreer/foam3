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

foam.RELATIONSHIP({
  package: 'net.nanopay.security',
  sourceModel: 'net.nanopay.security.PublicKeyEntry',
  targetModel: 'net.nanopay.security.KeyRight',
  forwardName: 'conditions',
  inverseName: 'keyRight',
  cardinality: '1:*',
});

foam.RELATIONSHIP({
  package: 'net.nanopay.account',
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.security.PublicKeyEntry',
  forwardName: 'keys',
  inverseName: 'account',
  targetDAOKey: 'publicKeyDAO',
  cardinality: '1:*',
  sourceProperty: {
    section: 'systemInformation',
    order: 20
  }
});
