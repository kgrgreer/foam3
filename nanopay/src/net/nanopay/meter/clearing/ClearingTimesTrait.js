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

foam.INTERFACE({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTimesTrait',

  properties: [
    {
      class: 'Map',
      name: 'clearingTimes',
      label: 'Custom Clearing Times',
      documentation: 'Custom clearing times of a transaction.',
      help: 'A list of clearing times applied to the transaction when sent.',
      visibility: 'RO',
      readPermissionRequired: true,
      writePermissionRequired: true,
      javaType: 'java.util.Map<String, Long>',
      javaFactory: ''
    },
    {
      class: 'DateTime',
      name: 'estimatedCompletionDate',
      view: function(_, x) {
        return foam.u2.Element.create()
          .start()
            .add(x.data.estimatedCompletionDate)
          .end();
      },
    },
    {
      class: 'DateTime',
      name: 'processDate',
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(
          foam.java.Method.create({
            name: 'copyClearingTimesFrom',
            type: 'void',
            visibility: 'default',
            args: [
              { name: 'obj', type: 'Object' }
            ],
            body: `
              if ( obj instanceof ClearingTimesTrait ) {
                setClearingTimes(((ClearingTimesTrait) obj).getClearingTimes());
              }
            `
          })
        );
      }
    }
  ]
});
