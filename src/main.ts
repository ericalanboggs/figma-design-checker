import { checkNaming } from './checks/naming';

export interface Violation {
  nodeId: string;
  nodeName: string;
  rule: string;
  category: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fixable?: boolean;
}

export interface CheckResult {
  violations: Violation[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
}

figma.showUI(__html__, { width: 400, height: 500 });

function getTargetNodes(): readonly SceneNode[] {
  if (figma.currentPage.selection.length > 0) {
    return figma.currentPage.selection;
  }
  return figma.currentPage.children;
}

function flattenNodes(nodes: readonly SceneNode[]): SceneNode[] {
  const result: SceneNode[] = [];

  function traverse(node: SceneNode) {
    result.push(node);
    if ('children' in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return result;
}

function runChecks(): CheckResult {
  const targetNodes = getTargetNodes();
  const allNodes = flattenNodes(targetNodes);

  const violations: Violation[] = [
    ...checkNaming(allNodes),
  ];

  const summary = {
    total: violations.length,
    errors: violations.filter(v => v.severity === 'error').length,
    warnings: violations.filter(v => v.severity === 'warning').length,
    info: violations.filter(v => v.severity === 'info').length,
  };

  return { violations, summary };
}

figma.ui.onmessage = (msg: { type: string; nodeId?: string; newName?: string }) => {
  switch (msg.type) {
    case 'run-checks': {
      const result = runChecks();
      figma.ui.postMessage({ type: 'check-results', data: result });
      break;
    }

    case 'select-node': {
      if (msg.nodeId) {
        const node = figma.getNodeById(msg.nodeId) as SceneNode | null;
        if (node) {
          figma.currentPage.selection = [node];
          figma.viewport.scrollAndZoomIntoView([node]);
        }
      }
      break;
    }

    case 'rename-node': {
      if (msg.nodeId && msg.newName) {
        const node = figma.getNodeById(msg.nodeId) as SceneNode | null;
        if (node) {
          node.name = msg.newName;
          figma.ui.postMessage({ type: 'node-renamed', nodeId: msg.nodeId, newName: msg.newName });
        }
      }
      break;
    }

    case 'close': {
      figma.closePlugin();
      break;
    }
  }
};
