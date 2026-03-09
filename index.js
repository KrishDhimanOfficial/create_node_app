#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
    console.log(chalk.green.bold('Welcome to create-node!'));

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            default: 'my-node-app',
            validate: (input) => {
                if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
                return 'Project name may only include letters, numbers, underscores and hashes.';
            }
        },
        {
            type: 'list',
            name: 'packageManager',
            message: 'Which package manager do you want to use?',
            choices: ['npm', 'yarn', 'pnpm']
        }
    ]);

    const { projectName, packageManager } = answers;
    const targetDir = path.join(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
        console.error(chalk.red(`\nDirectory ${projectName} already exists!`));
        process.exit(1);
    }

    // Create project directory
    console.log(chalk.blue(`\nCreating project in ${targetDir}...`));
    fs.mkdirSync(targetDir);

    // Copy template files
    const templateDir = path.join(__dirname, 'template');
    fs.copySync(templateDir, targetDir, {
        filter: (src) => !src.includes('node_modules')
    });

    // Modify package.json
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        pkg.name = projectName;
        pkg.version = '0.0.1';
        pkg.description = '';

        // Clear any private fields related to the template
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }

    console.log(chalk.blue(`Installing dependencies using ${packageManager}...`));

    try {
        execSync(`${packageManager} install`, { cwd: targetDir, stdio: 'inherit' });
        console.log(chalk.green.bold('\nSuccess! Project created.'));
        console.log(chalk.cyan(`\nInside that directory, you can run several commands:`));
        console.log(chalk.cyan(`  ${packageManager} start`));
        console.log(chalk.cyan(`    Starts the production server.`));
        console.log(chalk.cyan(`  ${packageManager} run dev`));
        console.log(chalk.cyan(`    Starts the development server.\n`));

        console.log(chalk.cyan(`We suggest that you begin by typing:`));
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan(`  ${packageManager} run dev`));
    } catch (e) {
        console.error(chalk.red('\nFailed to install dependencies.'), e.message);
    }
}

init().catch(e => {
    console.error(chalk.red('An unexpected error occurred:'), e);
    process.exit(1);
});
