/**
 * Test for server.js module entry point
 * Tests the if (require.main === module) block
 */

const { spawn } = require('child_process');
const path = require('path');

describe('Server Entry Point', () => {
  test('should start server when run directly', (done) => {
    // Spawn the server as a separate process
    const serverProcess = spawn('node', [path.join(__dirname, '../server.js')], {
      env: { ...process.env, PORT: '3001' } // Use different port to avoid conflicts
    });
    
    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      // Check if server started successfully
      if (output.includes('Trading Risk Calculator running')) {
        // Server started, kill it and pass test
        serverProcess.kill();
        expect(output).toContain('Trading Risk Calculator running');
        expect(output).toContain('http://localhost:3001');
        done();
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
    
    serverProcess.on('error', (error) => {
      serverProcess.kill();
      done(error);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      serverProcess.kill();
      if (!output.includes('Trading Risk Calculator running')) {
        done(new Error('Server did not start in time'));
      }
    }, 5000);
  }, 10000); // 10 second timeout for this test
});
