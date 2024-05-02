import express, { type Request, type Response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { codegen } from 'swagger-axios-codegen';
import fs from 'fs';
import path from 'path';
import serverless from "serverless-http";

const app = express();
// To parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML form at the root
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/codegen', async (req: Request, res: Response) => {
    const url: string = req.body.url;
    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        // Assume codegen function creates a TypeScript file in a specific directory
        const outputDir: string = `./api-client-${Date.now()}`;
        const outputPath: string = path.join(outputDir, 'index.ts'); // Path to the generated TypeScript file

        // Placeholder for your actual code generation logic
        await codegen({
            methodNameMode: 'operationId',
            remoteUrl: url,
            outputDir: outputDir,
        });

        // Use an absolute path for res.sendFile
        const absolutePath: string = path.resolve(outputPath);

        // Check if the file exists before trying to send it
        if (fs.existsSync(absolutePath)) {
            res.setHeader('Content-Disposition', 'attachment; filename=' + "generated.ts");
            res.sendFile(absolutePath, (err) => {
                if (err) {
                    console.error('Failed to send file:', err);
                    res.status(500).send('Failed to send file');
                } else {
                    console.log('File sent:', absolutePath);
                    // Optionally clean up the file after sending
                    fs.unlinkSync(absolutePath);
                }
            });
        } else {
            console.error('File not found:', absolutePath);
            res.status(404).send('Generated file not found');
        }
    } catch (error) {
        console.error('Error during code generation:', error);
        res.status(500).send('Failed to generate code');
    }
});
//export const handler = serverless(app);

const PORT: number | string = process.env.PORT || 8989;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});