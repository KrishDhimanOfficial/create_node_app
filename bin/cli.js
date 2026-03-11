#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { execSync } from 'child_process';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// Helper Functions
// ==========================================

async function promptUser(projectDirectory) {
    let targetDir = projectDirectory;

    if (!targetDir) {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectDirectory',
                message: 'What is your project named?',
                default: 'my-app'
            }
        ]);
        targetDir = answers.projectDirectory;
    }

    const { packageManager, database } = await inquirer.prompt([
        {
            type: 'list',
            name: 'packageManager',
            message: 'Which package manager would you like to use?',
            choices: ['npm', 'yarn', 'pnpm'],
            default: 'npm'
        },
        {
            type: 'list',
            name: 'database',
            message: 'Which database would you like to use?',
            choices: ['MongoDB (Mongoose)', 'PostgreSQL (Sequelize)', 'None'],
            default: 'MongoDB (Mongoose)'
        }
    ]);

    return { targetDir, packageManager, database };
}

function copyTemplateFiles(templateDir, targetPath) {
    const spinner = ora('Copying template files...').start();

    if (fs.existsSync(targetPath)) {
        spinner.fail(`Directory ${path.basename(targetPath)} already exists.`);
        process.exit(1);
    }

    fs.mkdirSync(targetPath, { recursive: true });

    const copyRecursiveSync = (src, dest) => {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        if (exists && stats.isDirectory()) {
            if (!fs.existsSync(dest)) fs.mkdirSync(dest);
            fs.readdirSync(src).forEach((child) => {
                if (child === 'node_modules') return;
                copyRecursiveSync(path.join(src, child), path.join(dest, child));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    };

    try {
        copyRecursiveSync(templateDir, targetPath);
        spinner.succeed('Template copied successfully.');
    } catch (err) {
        spinner.fail('Failed to copy template.');
        console.error(err);
        process.exit(1);
    }
}

function configureDatabase(targetPath, database) {
    const packageJsonPath = path.join(targetPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return;

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    pkg.name = path.basename(targetPath);

    const dbConfigPath = path.join(targetPath, 'config', 'db.config.js');
    const targetConfigDir = path.dirname(dbConfigPath);
    if (!fs.existsSync(targetConfigDir)) {
        fs.mkdirSync(targetConfigDir, { recursive: true });
    }

    if (database === 'MongoDB (Mongoose)') {
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies.mongoose = '^8.0.0';

        const mongooseContent = `import mongoose from "mongoose"

const options = {
    serverSelectionTimeoutMS: 10000,
    dbName: '',
}

const connectDB = async () => {
    try {
        await mongoose.connect('', options)
        console.log(\`✅ MongoDB connected!\`)
    } catch (error) {
        console.error(\`❌ MongoDB connection error: \${error.message}\`)
        process.exit(1)
    }
}

export default connectDB`;
        fs.writeFileSync(dbConfigPath, mongooseContent);

    } else if (database === 'PostgreSQL (Sequelize)') {
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies.sequelize = '^6.35.0';
        pkg.dependencies.pg = '^8.11.3';
        pkg.dependencies.pg_hstore = '^2.3.4';

        const sequelizeContent = `import { Sequelize } from "sequelize"

export const sequelize = new Sequelize(
    '',          // DB name
    '',         // User
    '',      // Password
    {
        host: '',
        dialect: 'postgres',
        logging: false,
        port: ''
    }
) 

// Test connection
// (async () => {
//     try {
//         await sequelize.authenticate();
//         console.log("PostgreSQL connected with Sequelize");
//     } catch (err) {
//         console.error("Error:", err.message);
//     }
// })()

export default sequelize
`;
        fs.writeFileSync(dbConfigPath, sequelizeContent);

    } else {
        fs.writeFileSync(dbConfigPath, '// No database configured\n');
    }

    // Save updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
}

function installDependencies(targetPath, packageManager) {
    const installSpinner = ora(`Installing dependencies using ${packageManager}...`).start();
    try {
        execSync(`${packageManager} install`, { cwd: targetPath, stdio: 'pipe' });
        installSpinner.succeed('Dependencies installed successfully.');
    } catch (err) {
        installSpinner.fail('Failed to install dependencies.');
        console.error(err);
    }
}

function showSuccessMessage(targetDir, targetPath, packageManager) {
    console.log(`\n${chalk.green('Success!')} Created ${path.basename(targetPath)} at ${targetPath}`);
    console.log('\nInside that directory, you can run several commands:\n');
    console.log(`  ${chalk.cyan(`${packageManager} run dev`)}`);
    console.log('    Starts the development server with nodemon.\n');
    console.log('We suggest that you begin by typing:\n');
    console.log(`  ${chalk.cyan('cd')} ${targetDir}`);
    console.log(`  ${chalk.cyan(`${packageManager} run dev`)}\n`);
}

// ==========================================
// CLI Application
// ==========================================

program
    .name('create-node-app')
    .description('Scaffold a new Node.js application')
    .argument('[project-directory]', 'Directory to create the project in')
    .action(async (projectDirectory) => {

        // 1. Prompt User
        const { targetDir, packageManager, database } = await promptUser(projectDirectory);
        const targetPath = path.resolve(process.cwd(), targetDir);
        const templateDir = path.join(__dirname, '..', 'template');

        console.log(`\nCreating a new Node.js app in ${chalk.green(targetPath)}\n`);

        // 2. Copy Template Files
        copyTemplateFiles(templateDir, targetPath);

        // 3. Configure Database
        configureDatabase(targetPath, database);

        // 4. Install Dependencies
        installDependencies(targetPath, packageManager);

        // 5. Success Message
        showSuccessMessage(targetDir, targetPath, packageManager);
    });

program.parse(process.argv);