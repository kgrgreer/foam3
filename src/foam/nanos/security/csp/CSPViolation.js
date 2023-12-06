/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.security.csp',
  name: 'CSPReportPayload',

  documentation: `Represents CSP report payload.
    Example payload:

      {
        "csp-report": {
          "document-uri": "http://localhost:8080/some/path",
          "referrer": "http://localhost:8080/",
          "violated-directive": "frame-src",
          "effective-directive": "frame-src",
          "original-policy": "frame-src 'self';",
          "disposition": "enforce",
          "blocked-uri": "http://anothersite.com/",
          "line-number": 522,
          "column-number": 1414,
          "source-file": "http://localhost:8080/foam-bin.js",
          "status-code": 200,
          "script-sample": ""
        }
      }

  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.security.csp.CSPViolation',
      name: 'CSPReport',
      shortName: 'csp-report'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.security.csp',
  name: 'CSPViolation',

  documentation: 'Content Security Policy violation report.',

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
      documentation: 'Date and time when the report was logged.'
    },
    {
      class: 'String',
      name: 'ip',
      documentation: 'IP address of the violator.'
    },
    {
      class: 'String',
      name: 'blockedURI',
      shortName: 'blocked-uri',
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
      shortName: 'document-uri',
      documentation: 'The URI of the document in which the violation occurred.'
    },
    {
      class: 'String',
      name: 'effectiveDirective',
      shortName: 'effective-directive',
      label: 'Violating Directive',
      documentation: 'The directive whose enforcement caused the violation.'
    },
    {
      class: 'String',
      name: 'originalPolicy',
      shortName: 'original-policy',
      documentation: 'The original policy as specified by the Content-Security-Policy HTTP header.'
    },
    {
      class: 'String',
      name: 'referrer',
      documentation: 'The referrer of the document in which the violation occurred.'
    },
    {
      class: 'String',
      name: 'scriptSample',
      shortName: 'script-sample',
      documentation: 'The first 40 characters of the inline script, event handler, or style that caused the violation.'
    },
    {
      class: 'Int',
      name: 'statusCode',
      shortName: 'status-code',
      documentation: 'The HTTP status code of the resource on which the global object was instantiated.'
    },
    {
      class: 'String',
      name: 'violatedDirective',
      shortName: 'violated-directive',
      documentation: 'The name of the policy section that was violated.'
    },
    {
      class: 'String',
      name: 'sourceFile',
      shortName: 'source-file',
      documentation: 'The URL of the resource where the violation occurred, stripped for reporting.'
    },
    {
      class: 'Int',
      name: 'lineNumber',
      shortName: 'line-number',
      documentation: 'The line number in the source-file where the violation occurred.'
    },
    {
      class: 'Int',
      name: 'columnNumber',
      shortName: 'column-number',
      documentation: 'The column number in the source-file where the violation occurred.'
    }
  ]
});
