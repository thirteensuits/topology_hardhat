const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const https = require('https'); // Import the https module

const app = express();
const PORT = process.env.PORT || 8080;

const httpsOptions = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

const deleteAllContracts = (dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.unlinkSync(filePath);
    });
  } else {
    console.error('Contracts directory does not exist.');
  }
};

app.post('/api/compileContract', async (req, res) => {
  const { contractCode, contractName } = req.body;
  console.log(contractName);
  const contractsDir = path.join(__dirname, 'stuff', 'contracts');
  const filePath = path.join(contractsDir, `${contractName}.sol`);
  console.log('File path for contract:', filePath);

  try {
    // Delete all files in the contracts directory
    deleteAllContracts(contractsDir);

    // Write the new contract file
    fs.writeFileSync(filePath, contractCode);

    // Compile the contract
    exec('npx hardhat compile', (error, stdout, stderr) => {
      if (error) {
        console.error('Error compiling contract:', error);
        return res.status(500).json({ success: false, error: 'Compilation failed' });
      }

      console.log('Compilation stdout:', stdout);
      console.error('Compilation stderr:', stderr);

      const artifactPath = path.join(__dirname, 'stuff', 'artifacts', 'stuff', 'contracts', `${contractName}.sol`, `${contractName}.json`);
      console.log(artifactPath);

      if (!fs.existsSync(artifactPath)) {
        return res.status(500).json({ success: false, error: 'Compiled artifact not found' });
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath));
      const { abi, bytecode } = artifact;
      console.log('Artifact:', artifact);

      
      res.json({ success: true, abi, bytecode });
    });

  } catch (error) {
    console.error('Error handling compile request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
