/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.auth.ruler',
  name: 'PreventDuplicateUsernameAction',
  extends: 'foam.nanos.auth.ruler.PreventDuplicateUsernameAction',

  documentation: `Prevents putting a user with an existing username.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.contacts.PersonalContact',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        // Skip check for Business and Contacts
        if ( obj instanceof Business || obj instanceof PersonalContact ) {
          return;
        }

        super.applyAction(x, obj, oldObj, ruler, rule, agency);
      `
    }
  ]
});
