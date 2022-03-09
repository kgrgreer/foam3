/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.script.jShell;

import java.util.LinkedList;
import java.util.List;

import jdk.jshell.JShell;
import jdk.jshell.SourceCodeAnalysis;

import foam.util.SafetyUtil;

/**
 * Parse the code and return a list of instruction
 *
 */
public class InstructionPresentation {
  public JShell jShell;
  List<String>  listInstruction = new LinkedList<String>();

  public InstructionPresentation(JShell jShell) {
    this.jShell = jShell;
  }

  public List<String> parseToInstruction(List<String> scripts) {
    String codeToParse = "";
    for (String line : scripts) {
      // if line is entirely empty, skip it
      // (works around NPE thrown during script execution,
      // unsure of actual cause)
      if (SafetyUtil.isEmpty(line)) continue;

      codeToParse += line + "\n";
      SourceCodeAnalysis.CompletionInfo info = jShell.sourceCodeAnalysis()
        .analyzeCompletion(codeToParse);
      if ( info.completeness()
        .isComplete() ) {
        listInstruction.add(codeToParse);
        codeToParse = "";
      }
    }
    return listInstruction;
  }
}
