const { exec } = require('child_process');

function killPort(port) {
  console.log(`🔍 Looking for processes on port ${port}...`);
  
  // For Windows
  exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`❌ No processes found on port ${port}`);
      return;
    }
    
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[4];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    });
    
    if (pids.size === 0) {
      console.log(`✅ No processes found on port ${port}`);
      return;
    }
    
    console.log(`📋 Found ${pids.size} process(es) on port ${port}:`);
    pids.forEach(pid => {
      console.log(`   PID: ${pid}`);
    });
    
    // Kill each process
    pids.forEach(pid => {
      exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
        if (error) {
          console.log(`❌ Failed to kill PID ${pid}:`, error.message);
        } else {
          console.log(`✅ Killed process PID ${pid}`);
        }
      });
    });
  });
}

// Get port from command line argument or default to 3000
const port = process.argv[2] || 3000;
killPort(port);
