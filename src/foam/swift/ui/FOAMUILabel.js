/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'FOAMUILabel',
  swiftImports: [
    'UIKit',
  ],
  properties: [
    {
      name: 'view',
      swiftType: 'UILabel',
      swiftFactory: 'return UILabel()',
      swiftPostSet: `
updateLabel();
     `,
    },
    {
      name: 'data',
      swiftPostSet: `
updateLabel();
      `,
    },
    {
      swiftType: 'UIColor?',
      name: 'textColor',
      swiftPostSet: `
updateLabel();
      `,
    },
  ],
  listeners: [
    {
      name: 'updateLabel',
      swiftCode: `
view.text = data == nil ? "nil" : String(describing: data!)
if let textColor = textColor { view.textColor = textColor }
     `,
    },
  ],
});
