// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Whitespace: AbstractFObject, Parser {

  lazy var parse$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let ps = args[0] as! PStream

    let x = args[1] as! ParserContext

    
    return self!.`parse`(
        _: ps, _: x)
  }
])
      
  }()

  public static let PARSE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parse"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var ps = ps
while ps.valid() {
  let c = ps.head()
  if c == " "  || c == "\t" || c == "\r" || c == "\n" {
    ps = ps.tail()
  } else {
    return ps;
  }
}
return nil
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Whitespace.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Whitespace.classInfo_
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


  case "parse": return `parse$`

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
  
    lazy var id: String = "foam.swift.parse.json.Whitespace"

    lazy var label: String = "Whitespace"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [PARSE]

    lazy var cls: AnyClass = Whitespace.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Whitespace(args, x)
    }

  }

}