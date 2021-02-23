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
  package: 'net.nanopay.fx.interac.model',
  name: 'PayoutOptions',
  requires: [ 'net.nanopay.fx.interac.model.RequiredUserFields' ],
  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'HIDDEN'
    },
    {
      class: 'StringArray',
      name: 'payoutOptions',
      documentation: 'Pay out options.',
      factory: function() {
        return ['A2A'];
      }
    },
    {
      class: 'String',
      documentation: 'For phase 2 FI',
      name: 'owner',
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.interac.model.RequiredUserFields',
      name: 'requiredUserFields',
      documentation: 'Requirements on users in order for pay outs to occur.',
      factory: function() {
        return [
          this.RequiredUserFields.create({userType: 'Sender'}),
          this.RequiredUserFields.create({userType: 'Receiver'})
        ];
      }
    }
  ]
});
