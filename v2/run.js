import { spawn } from 'child_process'


function runScriptWithRestart(script) {
  let process;

  const startProcess = () => {
    process = spawn('node', [script]);

    console.log(`[${script}] started with PID: ${process.pid}`);

    process.stdout.on('data', (data) => {
      console.log(`[${script} output]: ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${script} error]: ${data}`);
    });

    process.on('exit', (code) => {
      console.warn(`[${script}] exited with code: ${code}. Restarting...`);
      startProcess(); // Restart the process
    });
  };

  startProcess();
}

function runScripts(script1, script2) {
  runScriptWithRestart(script1);
  runScriptWithRestart(script2);
}

// Example usage
runScripts('serve.js', 'aggregate.js');
