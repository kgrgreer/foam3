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
  package: 'net.nanopay.tx',
  name: 'TxnProcessorUserReference',
  documentation: `The model use to store user reference that record in a specified payment platform.
                  We do not store payment card info in our system, so we need to store payment card info in the payment platform that user will use.
                  Then, we need to let payment platform to create a user and store the cards.
                  The user reference use to specify user in the payment platform`,

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.TxnProcessor',
      name: 'processorId',
      label: 'Processor'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      label: 'User'
    },
    {
      class: 'String',
      name: 'reference'
    }
  ]
});
