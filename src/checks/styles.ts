import type { Violation } from '../main';

function hasUnboundFillOrStroke(node: SceneNode): boolean {
  // Check if node has fills/strokes properties
  if (!('fills' in node) && !('strokes' in node)) return false;

  const fills = 'fills' in node ? (node.fills as readonly Paint[]) : [];
  const strokes = 'strokes' in node ? (node.strokes as readonly Paint[]) : [];

  // Handle figma.mixed case
  if (typeof fills === 'symbol' || typeof strokes === 'symbol') return true;

  for (const paint of [...fills, ...strokes]) {
    if (paint.type === 'SOLID' && paint.visible !== false) {
      // Check if color is bound to a variable
      const boundVariables = (paint as any).boundVariables;
      if (!boundVariables || !boundVariables.color) {
        return true; // Unbound solid color found
      }
    }
  }
  return false;
}

function hasUnlinkedTextStyle(node: SceneNode): boolean {
  if (node.type !== 'TEXT') return false;
  // textStyleId is empty string if no style is applied
  // Could also be mixed (symbol) if multiple styles in same text
  const styleId = (node as TextNode).textStyleId;
  return styleId === '' || typeof styleId === 'symbol';
}

function hasUnlinkedEffectStyle(node: SceneNode): boolean {
  if (!('effects' in node)) return false;
  const effects = (node as any).effects as readonly Effect[];
  if (!effects || effects.length === 0) return false;

  // Has effects but no effect style applied
  const effectStyleId = (node as any).effectStyleId;
  return effectStyleId === '' || typeof effectStyleId === 'symbol';
}

export function checkStyles(nodes: SceneNode[]): Violation[] {
  const violations: Violation[] = [];

  for (const node of nodes) {
    // Check for raw hex colors
    if (hasUnboundFillOrStroke(node)) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'color-variables',
        category: 'Variables & Styles',
        message: 'Uses hardcoded color instead of a color variable.',
        severity: 'warning',
        fixable: false,
      });
    }

    // Check for unlinked text styles
    if (hasUnlinkedTextStyle(node)) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'text-style',
        category: 'Variables & Styles',
        message: 'Text node does not use a shared text style.',
        severity: 'warning',
        fixable: false,
      });
    }

    // Check for unlinked effect styles
    if (hasUnlinkedEffectStyle(node)) {
      violations.push({
        nodeId: node.id,
        nodeName: node.name,
        rule: 'effect-style',
        category: 'Variables & Styles',
        message: 'Node has effects but no shared effect style applied.',
        severity: 'warning',
        fixable: false,
      });
    }
  }

  return violations;
}
