// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Substring: ProxyParser {

  private static var classInfo_: ClassInfo = ClassInfo_()

  public override func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
let start = ps
let ps = super.parse(ps, x)
if ps != nil {
  return ps!.setValue(start.substring(ps!))
}
return ps
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Substring.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Substring.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.Substring"

    lazy var label: String = "Substring"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [PARSE]

    lazy var cls: AnyClass = Substring.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Substring(args, x)
    }

  }

}