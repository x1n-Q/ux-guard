import { Node, SyntaxKind } from "ts-morph";

/**
 * Get the tag name (string) of a JsxOpeningElement / JsxSelfClosingElement.
 * Returns "" if the node is not a JSX element-like node.
 */
export function getJsxTagName(node: Node): string {
  if (Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)) {
    return node.getTagNameNode().getText();
  }
  if (Node.isJsxElement(node)) {
    return node.getOpeningElement().getTagNameNode().getText();
  }
  return "";
}

/**
 * Whether a node has a JSX ancestor within `maxDepth` parents.
 */
export function hasJsxAncestor(node: Node, maxDepth = 12): boolean {
  let cur: Node | undefined = node.getParent();
  let depth = 0;
  while (cur && depth < maxDepth) {
    const k = cur.getKind();
    if (
      k === SyntaxKind.JsxExpression ||
      k === SyntaxKind.JsxElement ||
      k === SyntaxKind.JsxFragment ||
      k === SyntaxKind.JsxSelfClosingElement
    ) {
      return true;
    }
    cur = cur.getParent();
    depth++;
  }
  return false;
}
