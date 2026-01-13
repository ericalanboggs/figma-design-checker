import type { Violation } from '../main';

function hasSubPixelValues(node: SceneNode): boolean {
  // Check if x, y, width, or height have decimal values
  if ('x' in node && 'y' in node) {
    if (node.x % 1 !== 0 || node.y % 1 !== 0) {
      return true;
    }
  }
  if ('width' in node && 'height' in node) {
    if (node.width % 1 !== 0 || node.height % 1 !== 0) {
      return true;
    }
  }
  return false;
}

function hasNon8pxSpacing(node: SceneNode): { invalid: boolean; values: string[] } {
  const invalidValues: string[] = [];

  // Only check nodes with auto-layout (they have gap and padding)
  if (!('layoutMode' in node) || (node as FrameNode).layoutMode === 'NONE') {
    return { invalid: false, values: [] };
  }

  const frame = node as FrameNode;

  // Check itemSpacing (gap)
  if (frame.itemSpacing % 8 !== 0) {
    invalidValues.push(`gap: ${frame.itemSpacing}px`);
  }

  // Check padding
  if (frame.paddingTop % 8 !== 0) {
    invalidValues.push(`padding-top: ${frame.paddingTop}px`);
  }
  if (frame.paddingRight % 8 !== 0) {
    invalidValues.push(`padding-right: ${frame.paddingRight}px`);
  }
  if (frame.paddingBottom % 8 !== 0) {
    invalidValues.push(`padding-bottom: ${frame.paddingBottom}px`);
  }
  if (frame.paddingLeft % 8 !== 0) {
    invalidValues.push(`padding-left: ${frame.paddingLeft}px`);
  }

  return { invalid: invalidValues.length > 0, values: invalidValues };
}

export function checkSpacing(nodes: SceneNode[]): Violation[] {
  const violations: Violation[] = [];

  for (const node of nodes) {
    // Check for sub-pixel values
    if (hasSubPixelValues(node)) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'sub-pixel',
        category: 'Spacing & Pixels',
        message: 'Has sub-pixel values. Use whole pixel values for crisp rendering.',
        severity: 'warning',
        fixable: false,
      });
    }

    // Check for non-8px spacing
    const spacingCheck = hasNon8pxSpacing(node);
    if (spacingCheck.invalid) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: '8px-grid',
        category: 'Spacing & Pixels',
        message: `Spacing not on 8px grid: ${spacingCheck.values.join(', ')}`,
        severity: 'warning',
        fixable: false,
      });
    }
  }

  return violations;
}
