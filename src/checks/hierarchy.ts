import type { Violation } from '../main';

function getNestingDepth(node: SceneNode): number {
  let depth = 0;
  let current: BaseNode | null = node.parent;

  while (current && current.type !== 'PAGE' && current.type !== 'DOCUMENT') {
    depth++;
    current = current.parent;
  }

  return depth;
}

export function checkHierarchy(nodes: SceneNode[]): Violation[] {
  const violations: Violation[] = [];

  for (const node of nodes) {
    // Flag all groups - should be frames
    if (node.type === 'GROUP') {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'group-to-frame',
        category: 'Layer Hierarchy',
        message: 'Groups should be converted to frames for better control and auto-layout support.',
        severity: 'warning',
        fixable: false,
      });
    }

    // Flag deep nesting (>7 levels)
    const depth = getNestingDepth(node);
    if (depth > 7) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'deep-nesting',
        category: 'Layer Hierarchy',
        message: `Nested ${depth} levels deep. Consider flattening the hierarchy (max 7 recommended).`,
        severity: 'warning',
        fixable: false,
      });
    }
  }

  return violations;
}
