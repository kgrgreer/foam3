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
  package: 'net.nanopay.security.csp',
  name: 'CSPViolation',

  documentation: `Content Security Policy violation report.`,

  tableColumns: [
    'id',
    'date',
    'ip'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 40,
      documentation: 'Sequence number.'
    },
    {
      class: 'DateTime',
      name: 'date',
      documentation: `Date and time when the report was logged.`
    },
    {
      class: 'String',
      name: 'ip',
      documentation: 'IP address of the violator.'
    },
    {
      class: 'String',
      name: 'blockedURI',
      documentation: `The URI of the resource that was blocked from loading by
        the Content Security Policy. If the blocked URI is from a different
        origin than the document-uri, then the blocked URI is truncated to
        contain just the scheme, host, and port.`
    },
    {
      class: 'String',
      name: 'disposition',
      documentation: `Either "enforce" or "reporting" depending on whether the
        Content-Security-Policy-Report-Only header or the Content-Security-Policy
        header is used.`
    },
    {
      class: 'String',
      name: 'documentURI',
      documentation: 'The URI of the document in which the violation occurred.'
    },
    {
      class: 'String',
      name: 'effectiveDirective',
      label: 'Violating Directive',
      documentation: 'The directive whose enforcement caused the violation.'
    },
    {
      class: 'String',
      name: 'originalPolicy',
      documentation: `The original policy as specified by the
        Content-Security-Policy HTTP header.`
    },
    {
      class: 'String',
      name: 'referrer',
      documentation: `The referrer of the document in which the violation
        occurred.`
    },
    {
      class: 'String',
      name: 'scriptSample',
      documentation: `The first 40 characters of the inline script, event
        handler, or style that caused the violation.`
    },
    {
      class: 'Int',
      name: 'statusCode',
      documentation: `The HTTP status code of the resource on which the global
        object was instantiated.`
    },
    {
      class: 'String',
      name: 'violatedDirective',
      documentation: 'The name of the policy section that was violated.'
    },
    {
      class: 'String',
      name: 'sourceFile',
      documentation: `The URL of the resource where the violation occurred,
        stripped for reporting.`
    },
    {
      class: 'Int',
      name: 'lineNumber',
      documentation: `The line number in the source-file where the violation
        occurred.`
    },
    {
      class: 'Int',
      name: 'columnNumber',
      documentation: `The column number in the source-file where the violation
        occurred.`
    }
  ]
});
