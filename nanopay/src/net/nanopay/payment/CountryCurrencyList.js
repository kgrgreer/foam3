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
    package: 'net.nanopay.payment',
    name: 'CountryCurrencyList',
    extends: 'foam.nanos.crunch.Capability',
    documentation: `Contains a list of currencies available to the specified country.
        Used as a capability to determine what currencies are available to the user in various components.
        
        On bank account create all country currency list objects are pulled and their currencies are provided as
        a selection for the denomination of the bank account.
        
        When attempting a payment using a payment provider, the country currency lists prerequisites will be required
        in order to process payment - along with any prerequisites pertaining to the payment provider and the payment provider
        corridor.`,
  
    properties: [
      {
        class: 'Reference',
        name: 'country',
        of: 'foam.nanos.auth.Country'
      },
      {
        class: 'StringArray',
        name: 'currencies',
        documentation: 'Agreed upon currencies in country.'
      },
      {
        class: 'Enum',
        of: 'net.nanopay.payment.SourceTargetType',
        name: 'type',
        documentation: 'States whether applied to source or target country on corridor.'
      }
    ]
  });
  