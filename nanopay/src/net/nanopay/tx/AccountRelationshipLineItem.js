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
  name: 'AccountRelationshipLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.AccountRelationship',
      name: 'accountRelationship',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView', 
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Please select',
          choices: [
            'Employee',
            'Contractor',
            'Client',
            'Other'
          ]
        },
        otherKey: 'Other'
      }
    }
  ]
});
