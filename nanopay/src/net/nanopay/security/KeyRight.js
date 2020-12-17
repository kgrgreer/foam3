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
  package: 'net.nanopay.security',
  name: 'KeyRight',

  documentation: `Modelled class for storing rights associated with an action,
    e.g. a transaction`,

  properties: [
    {
      class: 'String',
      name: 'label',
      documentation: 'An arbitrary string that is used to identify this right.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.security.RightCondition',
      name: 'conditions',
      documentation: `A set of conditions that must all pass before the right can be
        excercised.`
    },
    {
      class: 'Int',
      name: 'fraction',
      documentation: `The fraction of authority assigned to a public key,
      for a right. This number should lie in the range of [0,100], and represent
      the percentage of authority assigned to the associated key for 
      a KeyRight. The sum of rights of authorizing keys must be greater to or equal
      to one hundred for a right to be assigned. In the case authorisation is required
      from a single key, this number should be 100.`
    }
  ]
});
