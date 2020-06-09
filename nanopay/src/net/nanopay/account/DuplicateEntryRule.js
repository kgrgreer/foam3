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
  package: 'net.nanopay.account',
  name: 'DuplicateEntryRule',
  extends: 'foam.nanos.ruler.action.AbstractCheckDAOforMatching',

  documentation: `do a dao call to return an object matching the properties specified by an input. `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'ERROR_MESSAGE', message: 'An entry with the same details already exists' }
  ],

  methods: [
    {
      name: 'cmd',
      javaCode: `
        Count count = (Count) dao
        .where(
          EQ(nu.getClassInfo().getAxiomByName("deleted"), false)
        )
        .select(new Count());
        if ( count.getValue() != 0 )
          throw new RuntimeException(ERROR_MESSAGE);
      `
    },
  ]
});
