const express = require('express');
const cors = require('cors');
const path = require('path');

const server = express();
server.use(cors());
server.use(express.json());
server.use(express.static(path.join(__dirname, 'public')));

// Personal Details 
const USER_ID = 'chandraharika_20022005';
const EMAIL_ID = 'ch9930@srmist.edu.in';
const COLLEGE_ROLL_NUMBER = 'RA2311029010036';



// Check if given string follows correct "A->B" format
function checkValidFormat(input) {
  const value = input.trim();
  const res = value.match(/^([A-Z])->([A-Z])$/);

  if (!res) return false;
  if (res[1] === res[2]) return false; // ignore self loops

  return true;
}

// Convert valid string into parent-child object
function extractEdge(input) {
  const value = input.trim();
  const res = value.match(/^([A-Z])->([A-Z])$/);

  return res ? { from: res[1], to: res[2], raw: value } : null;
}


// Build nested tree starting from root
function createTreeStructure(startNode, graph, seen = new Set()) {
  seen.add(startNode);
  const branch = {};

  const children = graph[startNode] || [];

  for (const child of children) {
    if (!seen.has(child)) {
      branch[child] = createTreeStructure(child, graph, new Set(seen));
    }
  }

  return branch;
}


// Find maximum depth from root node
function calculateMaxDepth(node, graph, seen = new Set()) {
  if (seen.has(node)) return 0;

  seen.add(node);
  const nextNodes = graph[node] || [];

  if (nextNodes.length === 0) return 1;

  return 1 + Math.max(...nextNodes.map(n => calculateMaxDepth(n, graph, new Set(seen))));
}


// Detect cycle using DFS coloring technique
function detectCycle(nodesSet, graph) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const state = {};

  nodesSet.forEach(n => (state[n] = WHITE));

  function dfsCheck(curr) {
    state[curr] = GRAY;

    for (const nxt of (graph[curr] || [])) {
      if (!nodesSet.has(nxt)) continue;

      if (state[nxt] === GRAY) return true;
      if (state[nxt] === WHITE && dfsCheck(nxt)) return true;
    }

    state[curr] = BLACK;
    return false;
  }

  for (const node of nodesSet) {
    if (state[node] === WHITE && dfsCheck(node)) return true;
  }

  return false;
}


server.post('/bfhl', (req, res) => {

  // Basic request validation
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const inputArray = req.body.data;

  if (!Array.isArray(inputArray)) {
    return res.status(400).json({ error: '"data" should be an array' });
  }

  const invalid_entries = [];
  const duplicate_edges = [];

  const uniqueEdges = new Set();
  const filteredEdges = [];


  // Step 1: Clean + validate input
  for (const item of inputArray) {
    let cleaned;

    try {
      cleaned = String(item == null ? item : item).trim();
    } catch {
      invalid_entries.push('[unreadable]');
      continue;
    }

    if (!checkValidFormat(cleaned)) {
      invalid_entries.push(cleaned);
      continue;
    }

    const { from, to } = extractEdge(cleaned);
    const edgeKey = `${from}->${to}`;

    if (uniqueEdges.has(edgeKey)) {
      if (!duplicate_edges.includes(edgeKey)) {
        duplicate_edges.push(edgeKey);
      }
    } else {
      uniqueEdges.add(edgeKey);
      filteredEdges.push({ from, to });
    }
  }


  // Step 2: Build graph (child mapping + parent tracking)
  const graph = {};
  const parentMap = {};

  for (const { from, to } of filteredEdges) {
    if (parentMap[to] !== undefined) continue; // first parent wins

    parentMap[to] = from;

    if (!graph[from]) graph[from] = [];
    graph[from].push(to);

    if (!graph[to]) graph[to] = [];
  }

  const nodeSet = new Set(Object.keys(graph));


  // Helper to group connected components
  function collectGroup(start) {
    const group = new Set();
    const stack = [start];

    while (stack.length) {
      const curr = stack.pop();
      if (group.has(curr)) continue;

      group.add(curr);

      for (const c of (graph[curr] || [])) stack.push(c);

      for (const n of nodeSet) {
        if ((graph[n] || []).includes(curr)) stack.push(n);
      }
    }

    return group;
  }


  // Step 3: Find independent groups
  const visitedNodes = new Set();
  const allGroups = [];

  for (const node of nodeSet) {
    if (!visitedNodes.has(node)) {
      const grp = collectGroup(node);
      grp.forEach(n => visitedNodes.add(n));
      allGroups.push(grp);
    }
  }


  const hierarchies = [];


  // Step 4: Process each group
  for (const grp of allGroups) {

    const isLoop = detectCycle(grp, graph);

    const possibleRoots = [];

    for (const node of grp) {
      const parent = parentMap[node];

      if (parent === undefined || !grp.has(parent)) {
        possibleRoots.push(node);
      }
    }

    let rootNode;

    if (possibleRoots.length === 0) {
      rootNode = [...grp].sort()[0];
    } else {
      rootNode = possibleRoots.sort()[0];
    }

    if (isLoop) {
      hierarchies.push({
        root: rootNode,
        tree: {},
        has_cycle: true
      });
    } else {
      const treeData = createTreeStructure(rootNode, graph);
      const finalTree = { [rootNode]: treeData };

      const depthVal = calculateMaxDepth(rootNode, graph);

      hierarchies.push({
        root: rootNode,
        tree: finalTree,
        depth: depthVal
      });
    }
  }


  // Step 5: Sorting + summary
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  const trees = hierarchies.filter(h => !h.has_cycle);
  const cycles = hierarchies.filter(h => h.has_cycle);

  let largest_tree_root = '';

  if (trees.length > 0) {
    const maxDepth = Math.max(...trees.map(t => t.depth));
    const roots = trees
      .filter(t => t.depth === maxDepth)
      .map(t => t.root)
      .sort();

    largest_tree_root = roots[0];
  }


  // Final response
  res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: trees.length,
      total_cycles: cycles.length,
      largest_tree_root
    }
  });

});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});