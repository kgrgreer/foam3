/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.graphics',
  name: 'TreeNodeConfig',

  documentation: `
    A customizable model to configure a TreeNode
  `,

  properties: [
    {
      class: 'Color',
      name: 'nodeColor'
    },
    {
      class: 'Boolean',
      name: 'isNodeColorGradientUsed'
    },
    {
      class: 'Int',
      name: 'nodeCornerRadius'
    },
    {
      class: 'String',
      name: 'nodeBorder'
    },
    {
      class: 'Color',
      name: 'textColor'
    },
    {
      class: 'String',
      name: 'titleFontSize',
      value: '12px'
    },
    {
      class: 'String',
      name: 'titleFontWeight',
      value: '700'
    },
    {
      class: 'String',
      name: 'detailHeader'
    },
    {
      class: 'String',
      name: 'detailBodyFontSize',
      value: '10px'
    },
    {
      class: 'String',
      name: 'detailBodyFontWeight',
      value: '600'
    },
    {
      class: 'String',
      name: 'detailHeaderFontSize',
      value: '10px'
    },
    {
      class: 'String',
      name: 'detailHeaderFontWeight',
      value: '400'
    },
    {
      class: 'Boolean',
      name: 'isDetailHidden'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'detailDataPathFromData'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'nodeColorPathFromData'
    },
    {
      class: 'Function',
      name: 'detailDataFromFunction',
      value: null
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'textColorPathFromData'
    },
    {
      class: 'Int',
      name: 'height'
    },
    {
      class: 'Int',
      name: 'width'
    },
    {
      class: 'Int',
      name: 'nodePaddingTop'
    },
    {
      class: 'Int',
      name: 'nodePaddingBottom'
    },
    {
      class: 'Int',
      name: 'nodePaddingLeft'
    },
    {
      class: 'Int',
      name: 'nodePaddingRight'
    },
    {
      name: 'onClickNode'
    },
    {
      class: 'String',
      name: 'expandIconColor'
    },
    {
      class: 'String',
      name: 'expandIconWidth'
    },
    {
      class: 'String',
      name: 'border'
    }
  ]
});
