/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaReplayIssue',

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'index',
      class: 'Long'
    },
    {
      name: 'medusaEntry',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.MedusaEntry'
    },
    {
      name: 'object',
      class: 'FObjectProperty',
      of: 'foam.core.FObject'
    },
    {
      name: 'message',
      class: 'String'
    }
  ],

  javaCode: `
  public MedusaReplayIssue(MedusaEntry entry, String message) {
    setIndex(entry.getIndex());
    setMedusaEntry(entry);
    setMessage(message);
  }

  public MedusaReplayIssue(MedusaEntry entry, foam.core.FObject object, String message) {
    setIndex(entry.getIndex());
    setMedusaEntry(entry);
    setObject(object);
    setMessage(message);
  }
  `
});
