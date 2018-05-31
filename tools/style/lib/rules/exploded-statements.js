/**
 * @fileoverview space between if conditions
 * @author Shrey
 */
'use strict';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'exploded-statements',
      recommended: false
    },
    fixable: 'code',
    schema: []
  },

  create: function(context) {
    var code = context.getSourceCode();

    function checkSpaceBefore(node) {
      var prevToken = context.getTokenBefore(node);
      return code.isSpaceBetweenTokens(prevToken, node);
    }

    function checkSpaceAfter(node) {
      var nextToken = context.getTokenAfter(node);
      return code.isSpaceBetweenTokens(node, nextToken);
    }
    return {
      IfStatement: function(node) {
        if ( ! checkSpaceBefore(node.test) ) {
          context.report({
            node,
            message: 'One space required after "if ("',
            fix: function(fixer) {
              return fixer.insertTextBefore(node.test, ' ');
            }
          });
        }

        if ( ! checkSpaceAfter(node.test) ) {
          context.report({
            node,
            message: 'One space required before closing "if ( )',
            fix: function(fixer) {
              return fixer.insertTextAfter(node.test, ' ');
            }
          });
        }
      },
      WhileStatement: function(node) {
        if ( ! checkSpaceBefore(node.test) ) {
          context.report({
            node,
            message: 'One space required after "while ("',
            fix: function(fixer) {
              return fixer.insertTextBefore(node.test, ' ');
            }
          });
        }

        if ( ! checkSpaceAfter(node.test) ) {
          context.report({
            node,
            message: 'One space required before closing "while ( )"',
            fix: function(fixer) {
              return fixer.insertTextAfter(node.test, ' ');
            }
          });
        }
      },
      ForStatement: function(node) {
        if ( node.init ) {
          if ( ! checkSpaceBefore(node.init) ) {
            context.report({
              node,
              message: 'One space required after "for ("',
              fix: function(fixer) {
                return fixer.insertTextBefore(node.init, ' ');
              }
            });
          }
        }
        if ( node.update ) {
          if ( ! checkSpaceAfter(node.update) ) {
            context.report({
              node,
              message: 'One space required before closing "for ( )"',
              fix: function(fixer) {
                return fixer.insertTextAfter(node.update, ' ');
              }
            });
          }
        }
      },
      DoWhileStatement: function(node) {
        if ( ! checkSpaceBefore(node.test) ) {
          context.report({
            node,
            message: 'One space required after "do { } while ("',
            fix: function(fixer) {
              return fixer.insertTextBefore(node.test, ' ');
            }
          });
        }

        if ( ! checkSpaceAfter(node.test) ) {
          context.report({
            node,
            message: 'One space required before closing "do { } while ( )"',
            fix: function(fixer) {
              return fixer.insertTextAfter(node.test, ' ');
            }
          });
        }
      },
      SwitchStatement: function(node) {
        if ( node.discriminant ) {
          if ( ! checkSpaceBefore(node.discriminant) ) {
            context.report({
              node,
              message: 'One space required after "switch ("',
              fix: function(fixer) {
                return fixer.insertTextBefore(node.discriminant, ' ');
              }
            });
          }
          if ( ! checkSpaceAfter(node.discriminant) ) {
            context.report({
              node,
              message: 'One space required before closing "switch ( )"',
              fix: function(fixer) {
                return fixer.insertTextAfter(node.discriminant, ' ');
              }
            });
          }
        }
      },
      ForInStatement: function(node) {
        if ( node.left ) {
          if ( ! checkSpaceBefore(node.left) ) {
            context.report({
              node,
              message: 'One space required after "for ("',
              fix: function(fixer) {
                return fixer.insertTextBefore(node.left, ' ');
              }
            });
          }
        }
        if ( node.right ) {
          if ( ! checkSpaceAfter(node.right) ) {
            context.report({
              node,
              message: 'One space required before closing "for ( )"',
              fix: function(fixer) {
                return fixer.insertTextAfter(node.right, ' ');
              }
            });
          }
        }
      },
      ForOfStatement: function(node) {
        if ( node.left ) {
          if ( ! checkSpaceBefore(node.left) ) {
            context.report({
              node,
              message: 'One space required after "for ("',
              fix: function(fixer) {
                return fixer.insertTextBefore(node.left, ' ');
              }
            });
          }
        }
        if ( node.right ) {
          if ( ! checkSpaceAfter(node.right) ) {
            context.report({
              node,
              message: 'One space required before closing "for ( )"',
              fix: function(fixer) {
                return fixer.insertTextAfter(node.right, ' ');
              }
            });
          }
        }
      }
    };
  }
};
