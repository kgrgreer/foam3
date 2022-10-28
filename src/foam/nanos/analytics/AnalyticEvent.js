/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'AnalyticEvent',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'DateTime',
      name: 'timestamp'
    },
    {
      class: 'Duration',
      name: 'duration',
      units: 's'
    },
    {
      class: 'StringArray',
      name: 'tags'
    },
    {
      class: 'String',
      name: 'traceId'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.session.Session',
      name: 'sessionId'
    },
    {
      class: 'Object',
      name: 'objectId'
    },
    {
      class: 'String',
      name: 'extra'
    }
  ]
})
