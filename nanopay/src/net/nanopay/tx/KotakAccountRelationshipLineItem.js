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
  name: 'KotakAccountRelationshipLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  messages: [
      { name: 'DESCRIPTION', message: 'Kotak Payment Purpose' }
  ],

  properties: [
    {
      name: 'accountRelationship',
      class: 'Reference',
      of: 'net.nanopay.tx.AccountRelationship',
      label: 'Relationship with the contact',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Please Select',
          choices: [
            'Employer/Employee',
            'Contractor',
            'Vendor/Client',
            'Other'
          ]
        },
        otherKey: 'Other'
      },
      validationPredicates: [
        {
          args: ['accountRelationship'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.tx.KotakAccountRelationshipLineItem.ACCOUNT_RELATIONSHIP, '');
          },
          errorString: 'Please specify your Relationship with the contact.'
        }
      ],
    },
        {
      name: 'id',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'group',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'name',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'type',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'note',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'amount',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'requiresUserInput',
      readVisibility: 'HIDDEN',
      value: true
    }
  ],

  methods: [
    function validate() {
      if ( this.accountRelationship === '' ) {
        throw 'Relationship with the contact cannot be empty';
      }
    },

    function toSummary() {
      return this.DESCRIPTION;
    }
  ]
});
