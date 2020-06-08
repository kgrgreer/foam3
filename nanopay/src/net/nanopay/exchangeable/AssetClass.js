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
  package: 'net.nanopay.exchangeable',
  name: 'AssetClass',
  documentation: 'classifier for determining the haircuts of asset classes',
  ids: [
    'name'
  ],
  properties: [
    {
      class: 'String',
      name: 'name',
      required: true,
      documentation: 'name of the asset class'
    },
    {
      class: 'Long',
      name: 'haircut',
      documentation: ' the rate (as a percentage) by which to assign immediate value to an asset this is a multiplier',
      required: true
    }

  ],

  methods: [
    {
      name: 'cut',
      args: [
        {
          name: 'value',
          type: 'Long'
        }
      ],
      type: 'Long',
      javaCode: ` return ( (value * this.getHaircut()) / 100 );`,
      code: `return ( (value * this.haircut) / 100 );`
    }

  ]
})
