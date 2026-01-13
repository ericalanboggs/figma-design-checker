import type { Violation } from '../main';

export function checkCover(): Violation[] {
  const violations: Violation[] = [];

  // Get the first page
  const firstPage = figma.root.children[0];
  if (!firstPage) {
    return violations;
  }

  // Look for a frame named "Cover" (case-insensitive)
  const hasCover = firstPage.children.some(
    node => node.type === 'FRAME' && node.name.toLowerCase().includes('cover')
  );

  if (!hasCover) {
    violations.push({
      nodeId: firstPage.id,
      nodeName: firstPage.name,
      rule: 'cover-exists',
      category: 'Documentation',
      message: 'First page is missing a Cover frame. Add a cover with project info.',
      severity: 'info',
      fixable: false,
    });
  }

  return violations;
}
