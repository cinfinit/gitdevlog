#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Get absolute Git project path from Node
let projectDir = '';
try {
  projectDir = execSync('git rev-parse --show-toplevel').toString().trim();
} catch {
  console.error('❌ Not inside a Git repository.');
  process.exit(1);
}

// Final hook script with resolved directory path
const hookScript = `#!/bin/sh

open_new_terminal() {
  case "$(uname)" in
    Darwin)
      osascript <<EOF
tell application "Terminal"
  do script "cd '${projectDir}'; npx gitdevlog; echo Done. Press any key to exit; read -n 1"
  activate
end tell
EOF
      ;;
    Linux)
      if command -v gnome-terminal > /dev/null; then
        gnome-terminal --working-directory="${projectDir}" -- bash -c "npx gitdevlog; echo; echo 'Done. Press any key to exit'; read -n 1; exec bash"
      elif command -v x-terminal-emulator > /dev/null; then
        x-terminal-emulator -e bash -c "cd '${projectDir}'; npx gitdevlog; echo; echo 'Done. Press any key to exit'; read -n 1; exec bash"
      else
        echo "Please run 'gitdevlog' manually — no supported terminal found."
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*)
      start "" cmd /k "cd /d ${projectDir} && npx gitdevlog && pause"
      ;;
    *)
      echo "Unsupported OS. Please run 'gitdevlog' manually."
      ;;
  esac
}

open_new_terminal
`;

function installHook() {
  try {
    const gitHooksPath = path.resolve(projectDir, '.git', 'hooks');
    if (!fs.existsSync(gitHooksPath)) {
      console.error('❌ No .git/hooks directory found. Are you in a git repo?');
      process.exit(1);
    }

    const hookFile = path.join(gitHooksPath, 'post-commit');

    if (fs.existsSync(hookFile)) {
      const backupFile = path.join(gitHooksPath, `post-commit.backup-${Date.now()}`);
      fs.renameSync(hookFile, backupFile);
      console.log(`⚠️ Existing post-commit hook backed up to ${backupFile}`);
    }

    fs.writeFileSync(hookFile, hookScript, { mode: 0o755 });
    console.log('✅ Git post-commit hook installed successfully!');
  } catch (err) {
    console.error('❌ Failed to install git hook:', err.message);
    process.exit(1);
  }
}

function promptAndLog() {
  const logDir = path.resolve(projectDir, '.devlog/logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  let commit, message;
  try {
    commit = execSync('git rev-parse --short HEAD').toString().trim();
    message = execSync('git log -1 --pretty=%B').toString().trim();
  } catch {
    console.error('❌ Not inside a Git repo.');
    process.exit(1);
  }

  const timestamp = new Date().toISOString();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`\n💬 Want to log this commit? (leave empty to skip)\n> Log (why | notes): `, input => {
    rl.close();

    if (!input.trim()) return process.exit(0);

    const [why, notes] = input.split('|').map(part => part.trim());
    const log = { timestamp, commit, message, why, notes };
    const filename = `${timestamp.split('T')[0]}--${commit}.json`;

    fs.writeFileSync(path.join(logDir, filename), JSON.stringify(log, null, 2));
    console.log('✅ Log saved to .devlog/logs/');
  });
}


function listLogs() {
    const logDir = path.resolve(projectDir, '.devlog/logs');
    if (!fs.existsSync(logDir)) {
      console.log('No logs found.');
      return;
    }
  
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      console.log('No logs found.');
      return;
    }
  
    files.sort(); // optional: newest first
  
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(logDir, file), 'utf-8'));
      console.log(`\n🗓  ${data.timestamp}`);
      console.log(`🔧  Commit: ${data.commit}`);
      console.log(`📄  Message: ${data.message}`);
      if (data.why || data.notes) {
        console.log(`🧠  Why: ${data.why || ''}`);
        console.log(`📝  Notes: ${data.notes || ''}`);
      }
    }
  }
  
  function searchLogs(query) {
    const logDir = path.resolve(projectDir, '.devlog/logs');
    if (!fs.existsSync(logDir)) {
      console.log('No logs found.');
      return;
    }
  
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      console.log('No logs found.');
      return;
    }
  
    const results = files
      .map(file => JSON.parse(fs.readFileSync(path.join(logDir, file), 'utf-8')))
      .filter(log =>
        [log.message, log.why, log.notes].some(field =>
          field?.toLowerCase().includes(query.toLowerCase())
        )
      );
  
    if (results.length === 0) {
      console.log(`No logs found matching "${query}".`);
      return;
    }
  
    for (const data of results) {
      console.log(`\n🗓  ${data.timestamp}`);
      console.log(`🔧  Commit: ${data.commit}`);
      console.log(`📄  Message: ${data.message}`);
      console.log(`🧠  Why: ${data.why || ''}`);
      console.log(`📝  Notes: ${data.notes || ''}`);
    }
  }
  


function generateTimeline(asHtml = false) {
    const logDir = path.resolve(projectDir, '.devlog/logs');
    if (!fs.existsSync(logDir)) {
      console.log('No logs found.');
      return;
    }
  
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      console.log('No logs found.');
      return;
    }
  
    const logs = files
      .map(file => JSON.parse(fs.readFileSync(path.join(logDir, file), 'utf-8')))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
    if (asHtml) {
      generateHTMLTimeline(logs);
    } else {
      generateMarkdownTimeline(logs);
    }
  }

  function generateMarkdownTimeline(logs) {
    let md = '# Commit Timeline\n\n';
  
    logs.forEach(log => {
      md += `## ${log.commit} (${log.timestamp.split('T')[0]})\n\n`;
      md += `**Message:** ${log.message}\n\n`;
      if (log.why) md += `**Why:** ${log.why}\n\n`;
      if (log.notes) md += `**Notes:** ${log.notes}\n\n`;
      md += '---\n\n';
    });
  
    const outPath = path.resolve(projectDir, '.devlog/timeline.md');
    fs.writeFileSync(outPath, md);
  
    console.log(`✅ Markdown timeline generated at ${outPath}`);
  }
  

function generateHTMLTimeline(logs) {
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Git Devlog Timeline</title>
    <style>
      body {
        background-color: #121212;
        color: #f5f5f5;
        font-family: 'Segoe UI', sans-serif;
        margin: 2rem;
      }
      h1 {
        text-align: center;
      }
      input[type="text"] {
        width: 100%;
        padding: 0.5rem;
        margin: 1rem 0;
        font-size: 1rem;
        background: #1e1e1e;
        color: white;
        border: 1px solid #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }
      th, td {
        border: 1px solid #333;
        padding: 0.75rem;
        text-align: left;
      }
      th {
        background-color: #1f1f1f;
        cursor: pointer;
      }
      tr:nth-child(even) {
        background-color: #1a1a1a;
      }
      .hidden {
        display: none;
      }
    </style>
  </head>
  <body>
    <h1>Commit Timeline</h1>
    <input type="text" id="search" placeholder="Search logs by any field...">
  
    <table id="logTable">
      <thead>
        <tr>
          <th onclick="sortTable()">Date ▲</th>
          <th>Commit</th>
          <th>Message</th>
          <th>Why</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(log => `
          <tr>
            <td>${log.timestamp.split('T')[0]}</td>
            <td>${log.commit}</td>
            <td>${escapeHtml(log.message)}</td>
            <td>${escapeHtml(log.why || '')}</td>
            <td>${escapeHtml(log.notes || '')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  
    <script>
      const searchInput = document.getElementById('search');
      searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#logTable tbody tr');
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(filter) ? '' : 'none';
        });
      });
  
      let sortAsc = true;
      function sortTable() {
        const table = document.getElementById("logTable").tBodies[0];
        const rows = Array.from(table.rows);
  
        rows.sort((a, b) => {
          const dateA = new Date(a.cells[0].textContent.trim());
          const dateB = new Date(b.cells[0].textContent.trim());
          return sortAsc ? dateA - dateB : dateB - dateA;
        });
  
        rows.forEach(row => table.appendChild(row));
        sortAsc = !sortAsc;
  
        const header = document.querySelector("th");
        header.innerText = "Date " + (sortAsc ? "▲" : "▼");
      }
    </script>
  </body>
  </html>`;
  
    const outPath = path.resolve(projectDir, '.devlog/timeline.html');
    fs.writeFileSync(outPath, html);
    console.log(`✅ HTML timeline generated at ${outPath}`);
  }
  

function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
  

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    installHook();
    break;
  case 'list':
    listLogs();
    break;
  case 'search':
    if (!args[1]) {
      console.error('Please provide a search query.');
      process.exit(1);
    }
    searchLogs(args.slice(1).join(' '));
    break;
  case 'timeline':
    const html = args.includes('--html');
    generateTimeline(html);
    break;
  default:
    promptAndLog();
}
