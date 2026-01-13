import type { Violation } from '../main';

export function checkAutoLayout(nodes: SceneNode[]): Violation[] {
  const violations: Violation[] = [];

  for (const node of nodes) {
    // Only check frames (not groups, components handled separately)
    if (node.type !== 'FRAME') continue;

    // Skip top-level frames (direct children of the page)
    if (node.parent && node.parent.type === 'PAGE') continue;

    // Check if auto-layout is enabled
    if (node.layoutMode === 'NONE') {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'auto-layout',
        category: 'Auto-layout',
        message: 'Frame does not use auto-layout. Consider enabling auto-layout for responsive designs.',
        severity: 'warning',
        fixable: false,
      });
    }
  }

  return violations;
}
