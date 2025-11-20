const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('🚀 Starting Omni-Publisher test suite...\n');

  // Start mock server
  console.log('📡 Starting mock server...');
  const mockServer = spawn('node', ['scripts/mock-server.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, MOCK_SERVER_PORT: '3001' }
  });

  // Wait for server to start
  await new Promise((resolve) => {
    mockServer.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Mock server running on port 3001')) {
        console.log('✅ Mock server started successfully');
        resolve();
      }
    });
  });

  // Wait a bit more for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Build TypeScript
    console.log('🔨 Building TypeScript...');
    await runCommand('npm run build');

    // Run publisher in mock mode with dry run
    console.log('📤 Testing publisher with mock APIs...');
    await runCommand('npm run publish -- --mock --dry-run');

    // Check if .postmap.json was created/updated
    const postmapPath = '.postmap.json';
    if (fs.existsSync(postmapPath)) {
      const postmap = JSON.parse(fs.readFileSync(postmapPath, 'utf-8'));
      console.log('✅ Post mapping file updated');

      // Count mappings
      let totalMappings = 0;
      for (const fileMappings of Object.values(postmap)) {
        totalMappings += Object.keys(fileMappings).length;
      }
      console.log(`📊 Total mappings created: ${totalMappings}`);
    } else {
      console.log('❌ Post mapping file not found');
      throw new Error('Post mapping file not created');
    }

    // Check logs directory
    const logsDir = 'logs';
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
      console.log(`✅ Log files created: ${logFiles.length}`);

      // Check latest log file
      if (logFiles.length > 0) {
        const latestLog = logFiles.sort().pop();
        const logContent = fs.readFileSync(path.join(logsDir, latestLog), 'utf-8');
        const logLines = logContent.split('\n').filter(line => line.trim());

        console.log(`📝 Log entries: ${logLines.length}`);
        console.log('🎯 Test Results:');
        console.log('  ✅ Mock server started');
        console.log('  ✅ TypeScript compilation successful');
        console.log('  ✅ Publisher executed without errors');
        console.log('  ✅ Post mappings created');
        console.log('  ✅ Logging system functional');
        console.log('\n🎉 All tests passed!');
      }
    } else {
      console.log('❌ Logs directory not found');
      throw new Error('Logging system not functional');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    console.log('\n🧹 Cleaning up...');
    mockServer.kill();

    // Remove test artifacts
    if (fs.existsSync('.postmap.json')) {
      fs.unlinkSync('.postmap.json');
      console.log('🗑️  Removed test postmap file');
    }

    if (fs.existsSync('logs')) {
      fs.rmSync('logs', { recursive: true, force: true });
      console.log('🗑️  Removed test logs');
    }
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      stdio: ['inherit', 'inherit', 'inherit']
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Test interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Test terminated');
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});