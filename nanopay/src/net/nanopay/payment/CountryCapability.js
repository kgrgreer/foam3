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
    name: 'CountryCapability',
    extends: 'foam.nanos.crunch.Capability',
    documentation: `Used as a capability to determine requirements to transact in a payment provider corridor.
        
        When attempting a payment using a payment provider, both source and target country capabilities will be required
        in order to process payment - along with any prerequisites pertaining to the payment provider and the payment provider
        corridor.`,

    implements: [
      'foam.core.Validatable'
    ],

    javaImports: [
      'foam.nanos.auth.Country'
    ],

    messages: [
      { name: 'UNSUPPORTED_COUNTRY', message: 'Error: Country provided is not supported.' }
    ],

    properties: [
      {
        class: 'Reference',
        name: 'country',
        of: 'foam.nanos.auth.Country',
        targetDAOKey: 'countryDAO'
      },
      {
        class: 'Enum',
        of: 'net.nanopay.payment.SourceTargetType',
        name: 'type',
        documentation: 'States whether applied to source or target country on corridor.'
      }
    ],

    methods: [
      {
        name: 'validate',
        args: [
          { name: 'x', type: 'Context' }
        ],
        type: 'Void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
          if ( ((Country) findCountry(x)) == null ) {
            throw new IllegalStateException(UNSUPPORTED_COUNTRY + getCountry());
          }
         `
      }
    ]
  });
  