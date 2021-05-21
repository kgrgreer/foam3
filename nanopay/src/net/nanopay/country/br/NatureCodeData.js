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
  package: 'net.nanopay.country.br',
  name: 'NatureCodeData',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject'
  ],

  ids: [
    'payerType',
    'approvalType',
    'payeeType',
    'groupCode',
    'natureCode'
  ],

  sections: [
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'payerType',
      documentation: '00 - Physical person domiciled in the country, 09 - Non-financial company - private',
      minLength: 2,
      maxLength: 2
    },
    {
      class: 'String',
      name: 'approvalType',
      minLength: 1,
      maxLength: 1
    },
    {
      class: 'String',
      name: 'payeeType',
      documentation: '02 - Physical person domiciled abroad, 05 - Non-financial company - private, 90 - No payer/recipient',
      minLength: 2,
      maxLength: 2
    },
    {
      class: 'String',
      name: 'groupCode',
      documentation: '90 - others',
      minLength: 2,
      maxLength: 2
    },
    {
      class: 'String',
      name: 'natureCode',
      documentation: 'Shadow natureCode relationship property for use in multipart id.'
    }
  ],

  methods: [
    function toSummary() {
      return this.toString();
    },
    {
      name: 'toString',
      code: function() {
        return `${this.payerType} ${this.approvalType} ${this.payeeType} ${this.groupCode}
        `;
      },
      javaCode: `
        return getPayerType() + " " + getApprovalType() + " " + getPayeeType() + " " + getGroupCode();
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        var auth    = (AuthService) x.get("auth");
        var subject = (Subject) x.get("subject");
        var user    = subject.getRealUser();

        if ( ! auth.check(x, "naturecodedata.create." + getNatureCode()) ) {
          throw new AuthorizationException("You don't have permission to create this nature code data.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        var auth    = (AuthService) x.get("auth");
        var subject = (Subject) x.get("subject");
        var user    = subject.getRealUser();

        if ( ! auth.check(x, "naturecodedata.read." + getNatureCode()) ) {
          throw new AuthorizationException("You don't have permission to read this nature code data.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        var auth    = (AuthService) x.get("auth");
        var subject = (Subject) x.get("subject");
        var user    = subject.getRealUser();

        if ( ! auth.check(x, "naturecodedata.update." + getNatureCode()) ) {
          throw new AuthorizationException("You don't have permission to update this nature code data.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        var auth    = (AuthService) x.get("auth");
        var subject = (Subject) x.get("subject");
        var user    = subject.getRealUser();

        if ( ! auth.check(x, "naturecodedata.remove." + getNatureCode()) ) {
          throw new AuthorizationException("You don't have permission to delete this nature code data.");
        }
      `
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.country.br.NatureCode',
  targetModel: 'net.nanopay.country.br.NatureCodeData',
  forwardName: 'data',
  inverseName: 'natureCode',
  cardinality: '1:*'
});
