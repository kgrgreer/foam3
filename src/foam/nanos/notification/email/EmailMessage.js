/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessage',

  documentation: 'Email message',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  mixins: [
    'foam.nanos.medusa.ClusterableMixin'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.ServiceProviderAwareSupport',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map'
  ],

  tableColumns: [
    'created',
    'subject',
    'to',
    'from',
    'status'
  ],

  sections: [
    {
      name: 'emailInformation',
      order: 10
    },
    {
      name: 'templateInformation',
      title: 'Template Arguments',
      order: 20
    },
    {
      name: 'attachmentInformation',
      title: 'Attachments',
      order: 30
    },
    {
      name: 'systemInformation',
      help: 'Properties that are used internally by the system.',
      order: 40,
      permissionRequired: true
    },
  ],

  javaCode: `
  public EmailMessage(X x, Long userId, Map args) {
    setX(x);
    setUser(userId);
    setTemplateArguments(args);
  }
  /**
   * constructor for EmailsUtility migration
   * @Deprecated
   */
  public EmailMessage(X x, Long userId, String template, Map args) {
    setX(x);
    setUser(userId);
    if ( ! SafetyUtil.isEmpty(template) ) {
      if ( args == null ) {
        args = new HashMap();
      }
      args.put("template", template);
    }
    setTemplateArguments(args);
  }
  `,

  properties: [
    {
      class: 'Long',
      name: 'id',
      includeInDigest: true,
      section: 'emailInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      visibility: 'HIDDEN'
    },
    {
      class: 'DateTime',
      name: 'created',
      includeInDigest: true,
      section: 'emailInformation',
      order: 20,
      gridColumns: 6,
      tableWidth: 170
    },
    {
      class: 'String',
      name: 'displayName',
      includeInDigest: true,
      section: 'emailInformation',
      order: 30,
      gridColumns: 6,
      value: null
    },
    {
      class: 'String',
      name: 'from',
      includeInDigest: true,
      section: 'emailInformation',
      order: 40,
      gridColumns: 3,
      value: null
    },
    {
      class: 'String',
      name: 'replyTo',
      includeInDigest: true,
      section: 'emailInformation',
      order: 50,
      gridColumns: 3,
      value: null
    },
    {
      class: 'StringArray',
      name: 'to',
      includeInDigest: true,
      section: 'emailInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'StringArray',
      name: 'cc',
      includeInDigest: true,
      section: 'emailInformation',
      order: 70,
      gridColumns: 3
    },
    {
      class: 'StringArray',
      name: 'bcc',
      includeInDigest: true,
      section: 'emailInformation',
      order: 80,
      gridColumns: 3
    },
    {
      class: 'String',
      name: 'subject',
      includeInDigest: true,
      section: 'emailInformation',
      order: 90,
      gridColumns: 6
    },
    {
      class: 'Enum',
      of: 'foam.nanos.notification.email.Status',
      name: 'status',
      value: 'DRAFT',
      includeInDigest: false,
      section: 'emailInformation',
      order: 100,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'body',
      includeInDigest: true,
      section: 'emailInformation',
      order: 110,
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.IFrameHTMLView' },
          { class: 'foam.u2.tag.TextArea', rows: 30, cols: 130 }
        ]
      }
    },
    {
      class: 'Map',
      name: 'templateArguments',
      storageTransient: true,
      section: 'templateInformation',
      order: 10,
      view: { class: 'foam.u2.view.MapView' }
    },
    {
      class: 'StringArray',
      name: 'attachments',
      visibility: 'RO',
      section: 'attachmentInformation',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value && value.length || 0);
      }
    },
    {
      class: 'DateTime',
      name: 'sentDate',
      visibility: 'RO',
      section: 'emailInformation',
      order: '115'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      section: 'emailInformation',
      order: 120,
      gridColumns: 6,
      documentation: 'User who created the entry',
      includeInDigest: true,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      section: 'emailInformation',
      order: 130,
      gridColumns: 6,
      documentation: 'User who created the entry',
      includeInDigest: true,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      includeInDigest: true,
      tableWidth: 120,
      section: 'systemInformation',
      order: 10,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      storageTransient: true,
      javaFactory: `
        var map = new java.util.HashMap();
        map.put(
          EmailMessage.class.getName(),
          new foam.core.PropertyInfo[] { EmailMessage.USER }
        );
        return new ServiceProviderAwareSupport()
          .findSpid(foam.core.XLocator.get(), map, this);
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      value: '1',
      transient: true,
      hidden: true,
      documentation: 'Added to suppress journal comments regarding "modified by". Also, a non-null value is required.',
      javaFactory: 'return 1L;'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      value: '1',
      transient: true,
      hidden: true,
      javaFactory: 'return 1L;'
    }
  ]
});
