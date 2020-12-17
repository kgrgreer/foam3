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
  name: 'RequiredUserFields',
  requires: [
    'net.nanopay.fx.interac.model.RequiredAddressFields',
    'net.nanopay.fx.interac.model.RequiredIdentificationFields',
    'net.nanopay.fx.interac.model.RequiredAccountFields',
    'net.nanopay.fx.interac.model.RequiredAgentFields'
  ],
  properties: [
    {
      class: 'String',
      name: 'userType',
      visibility: 'RO',
      documentation: 'Will be repeated twice, once for the sender and the other for the receiver. Possible values "Sender" | "Receiver"',
      view: function() {
        return foam.u2.view.ChoiceView.create({
          choices: [
            'Sender',
            'Receiver'
          ]
        });
      },
    },
    {
      class: 'Boolean',
      name: 'currency',
      documentation: 'Currency of the Sender (eg: CAD) or Receiver (eg: INR)',
    },
    {
      class: 'Boolean',
      name: 'country',
      documentation: 'Country of the Sender (eg: CA) or Receiver (eg: IN)',
    },
    {
      class: 'Boolean',
      name: 'name',
      documentation: 'Name of user',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredAddressFields',
      name: 'postalAddress',
      expression: function(userType) {
        // NOTE WARNING: This is TEMPORARY and just following the spec
        if ( userType === 'Sender' ) {
          return this.RequiredAddressFields.create({ 'structured': true });
        } else {
          return this.RequiredAddressFields.create({ 'structured': false });
        }

      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredIdentificationFields',
      name: 'identification',
      factory: function() {
        return this.RequiredIdentificationFields.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredAccountFields',
      name: 'account',
      factory: function() {
        return this.RequiredAccountFields.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredAgentFields',
      name: 'agent',
      expression: function(userType) {
        if ( userType === 'Sender' ) {
          return this.RequiredAgentFields.create({ memberCode: 'CACPA' });
        } else {
          return this.RequiredAgentFields.create({ memberCode: 'INFSC' });
        }
      }
    }
  ]
});
