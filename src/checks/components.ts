import type { Violation } from '../main';

export function checkComponents(nodes: SceneNode[]): Violation[] {
  const violations: Violation[] = [];

  // Track component names to find duplicates
  const componentNames = new Map<string, SceneNode[]>();

  for (const node of nodes) {
    // Track local components for duplicate detection
    if (node.type === 'COMPONENT') {
      const existing = componentNames.get(node.name) || [];
      existing.push(node);
      componentNames.set(node.name, existing);
    }
  }

  // Flag duplicate component names
  for (const [name, components] of componentNames) {
    if (components.length > 1) {
      for (const comp of components) {
        violations.push({
          nodeId: comp.id,
          nodeName: comp.name,
          rule: 'duplicate-component',
          category: 'Components',
          message: `Component name "${name}" is used ${components.length} times. Use unique names.`,
          severity: 'warning',
          fixable: true,
        });
      }
    }
  }

  return violations;
}
