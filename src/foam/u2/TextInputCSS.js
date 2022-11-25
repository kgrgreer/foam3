/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'TextInputCSS',
  extends: 'foam.u2.CSS',

  documentation: `
    A CSS axiom for text-based inputs such as normal text inputs, date & time
    inputs, selects, and number inputs. We didn't put this directly on
    foam.u2.Input because other inputs that extend that model such as checkbox
    and radio inputs aren't text-based and therefore the styles don't make sense
    for them.
  `,

  properties: [
    {
      name: 'code',
      value: `
        ^ {
          min-width: 64px;
          height: $inputHeight;
          font-size: 1.4rem;
          padding-left: $inputHorizontalPadding;
          padding-right: $inputHorizontalPadding;
          border: 1px solid;
          border-radius: $inputBorderRadius;
          color: $black;
          background-color:$white;
          border-color: $grey400;
          width: 100%;
        }

        ^:hover {
          border-color: $grey500;
        }

        ^:hover::placeholder,
        ^:hover:-ms-input-placeholder,
        ^:hover::-ms-input-placeholder {
          color: $grey500;
        }

        ^:focus {
          outline: none;
          border-color: $primary400;
        }

        ^:disabled {
          color: $grey700;
          background-color: $grey50;
          border-color: $grey400;
        }

        ^.error {
          color: $destructive400;
          background-color: $destructive50;
          border-color: $destructive400;
        }
      `,
    },
  ],
});
