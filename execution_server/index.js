const express = require("express");
const fs = require("fs");
const path = require("path");
const Docker = require("dockerode");

const app = express();
const docker = new Docker();
app.use(express.json());

const TIMEOUT_SECONDS = 5; 
const SANDBOX_IMAGE = { 
    python: "python:3.9-alpine",  
    javascript: "node:20-alpine"  
};

const TEMP_DIR = path.join(__dirname, "sandbox");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

app.post("/execute", async (req, res) => {
    const { language, code } = req.body;
    if (!SANDBOX_IMAGE[language]) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    const filename = `code.${language === "python" ? "py" : "js"}`;
    const filepath = path.join(TEMP_DIR, filename);

    try {
        fs.writeFileSync(filepath, code);
        console.log(`✔ Code written to ${filepath}`);

        if (!fs.existsSync(filepath)) throw new Error("Code file not created!");

        const container = await docker.createContainer({
            Image: SANDBOX_IMAGE[language],
            Cmd: language === "python"
                ? ["python3", "-u", `/sandbox/${filename}`]
                : ["node", `/sandbox/${filename}`], // Fixed Node.js execution
            HostConfig: {
                Memory: 100 * 1024 * 1024,  
                CpuShares: 1024,            
                NetworkMode: "none",        
                Binds: [`${TEMP_DIR}:/sandbox`],  // Fixed Bind Mount
            },
            AttachStdout: true,
            AttachStderr: true,
        });

        console.log(`🚀 Starting ${language} container...`);
        await container.start();
        const result = await container.wait({ timeout: TIMEOUT_SECONDS * 1000 });

        const logs = await container.logs({ stdout: true, stderr: true });
        let output = logs.toString("utf-8").trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '');

        console.log("✅ Execution Output:", output);
        await container.remove();
        fs.unlinkSync(filepath);

        return res.json({ output });

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Docker Sandbox running on port 3000"));
