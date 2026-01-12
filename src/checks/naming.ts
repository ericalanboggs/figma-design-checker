import type { Violation } from '../main';

// Patterns for non-semantic names
const NON_SEMANTIC_PATTERNS = [
  /^Frame \d+$/,
  /^Group \d+$/,
  /^Rectangle \d+$/,
  /^Ellipse \d+$/,
  /^Line \d+$/,
  /^Vector \d+$/,
  /^Text \d*$/,
  /^Image \d*$/,
  /^Polygon \d+$/,
  /^Star \d+$/,
  /^Component \d+$/,
  /^Instance \d*$/,
  /^Slice \d*$/,
  /^Boolean \d*$/,
  /^\d+\.?\.?\.?$/,           // Pure numbers, with optional trailing dots (e.g., "1234059", "123...")
  /^[\d\s\-_.]+$/,            // Only numbers, spaces, dashes, underscores, dots
];

function isNonSemanticName(name: string): boolean {
  return NON_SEMANTIC_PATTERNS.some(pattern => pattern.test(name));
}

function checkParentChildConsistency(node: SceneNode): string | null {
  if (!node.parent || node.parent.type === 'PAGE') {
    return null;
  }

  const parentName = node.parent.name.toLowerCase();
  const childName = node.name.toLowerCase();

  // Check for inconsistent naming (e.g., parent "Modal" but child "Popup...")
  const inconsistentPairs = [
    { parent: 'modal', child: 'popup' },
    { parent: 'popup', child: 'modal' },
    { parent: 'button', child: 'btn' },
    { parent: 'btn', child: 'button' },
    { parent: 'dialog', child: 'modal' },
    { parent: 'card', child: 'tile' },
  ];

  for (const pair of inconsistentPairs) {
    if (parentName.includes(pair.parent) && childName.includes(pair.child)) {
      return `Child uses "${pair.child}" but parent uses "${pair.parent}"`;
    }
  }

  return null;
}

export function checkNaming(nodes: SceneNode[]): Violation[] {
  const violations: Violation[] = [];

  for (const node of nodes) {
    // Check for non-semantic names
    if (isNonSemanticName(node.name)) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'semantic-naming',
        category: 'Naming',
        message: `"${node.name}" is a non-semantic name. Use a descriptive name like "Button Container" or "Header Section".`,
        severity: 'warning',
        fixable: true,
      });
    }

    // Check parent-child naming consistency
    const inconsistency = checkParentChildConsistency(node);
    if (inconsistency) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'naming-consistency',
        category: 'Naming',
        message: inconsistency,
        severity: 'info',
        fixable: true,
      });
    }
  }

  return violations;
}
