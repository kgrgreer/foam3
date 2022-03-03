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
    int    i           = 0;
    String codeToParse = "";
    while ( i < scripts.size() ) {
      String instruction = checkEmptyInstruction(scripts.get(i));
      codeToParse += instruction;
      SourceCodeAnalysis.CompletionInfo info = jShell.sourceCodeAnalysis()
        .analyzeCompletion(codeToParse);
      if ( info.completeness()
        .isComplete() ) {
        listInstruction.add(codeToParse);
        codeToParse = "";
      }
      i++;
    }
    return listInstruction;
  }

  private String checkEmptyInstruction(String instruction) {
    if ( instruction.startsWith("//") ) instruction = "";

    if ( instruction.contains("//") ) {
      instruction = instruction.substring(0, instruction.indexOf("//"));
    }

    return instruction;
  }
}
