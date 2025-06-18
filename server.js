// Workspace data store (in-memory)
const workspaces = {
  alice: {
    default: {
      files: {
        "index.js": "// Welcome to your workspace\nconsole.log('Hello world');",
        "README.md": "# Project README"
      }
    }
  }
};

// Middleware to check workspace ownership
function workspaceAuth(req, res, next) {
  const username = req.session.user?.username;
  const { workspaceID } = req.params;
  if (!username) return res.status(401).json({ error: 'Unauthorized' });

  // For demo, workspaceID == 'default' and user must own it
  if (!workspaces[username] || !workspaces[username][workspaceID]) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  next();
}

// Get workspace root (list files)
app.get('/api/workspace/:workspaceID', auth, workspaceAuth, (req, res) => {
  const username = req.session.user.username;
  const { workspaceID } = req.params;
  const files = Object.keys(workspaces[username][workspaceID].files);
  res.json({ workspaceID, files });
});

// List files (same as above, redundant?)
// Could be merged, but for your route:
app.get('/api/workspace/:workspaceID/files', auth, workspaceAuth, (req, res) => {
  const username = req.session.user.username;
  const { workspaceID } = req.params;
  const files = Object.keys(workspaces[username][workspaceID].files);
  res.json(files);
});

// Get file content for editing
app.get('/api/workspace/:workspaceID/editor', auth, workspaceAuth, (req, res) => {
  const username = req.session.user.username;
  const { workspaceID } = req.params;
  const file = req.query.file;
  if (!file || !workspaces[username][workspaceID].files[file]) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.json({ filename: file, content: workspaces[username][workspaceID].files[file] });
});

// Save file content (for editing)
app.post('/api/workspace/:workspaceID/editor', auth, workspaceAuth, (req, res) => {
  const username = req.session.user.username;
  const { workspaceID } = req.params;
  const { filename, content } = req.body;
  if (!filename || content === undefined) {
    return res.status(400).json({ error: 'filename and content required' });
  }
  workspaces[username][workspaceID].files[filename] = content;
  res.json({ success: true });
});

// Test a file (simulate running code)
app.get('/api/workspace/:workspaceID/test/:fileName', auth, workspaceAuth, (req, res) => {
  const username = req.session.user.username;
  const { workspaceID, fileName } = req.params;
  if (!workspaces[username][workspaceID].files[fileName]) {
    return res.status(404).json({ error: 'File not found' });
  }
  // For demo: just return a fake test result
  res.json({ file: fileName, result: `Ran tests on ${fileName} — all passed! 🚀` });
});
