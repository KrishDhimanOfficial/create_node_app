# create-node-app

A fast and interactive CLI tool to scaffold Node.js applications.

## Features

- **Interactive Prompts**: Choose your project name, package manager, and database just by answering simple questions.
- **Multiple Package Managers**: Supports `npm`, `yarn`, and `pnpm`.
- **Database Configuration**: Automatically configures database connections with pre-written boilerplate for:
  - MongoDB (using Mongoose)
  - PostgreSQL (using Sequelize)
  - None (no database setup out-of-the-box)
- **Ready to Go**: Automatically installs dependencies and sets up the basic folder structure based on the provided template.

## Usage

You can use the CLI directly:

```bash
npx create-node-app [project-directory]
```

Or, if you clone locally and link:

```bash
npm start -- my-new-project
```

### Interactive Prompts

If you do not provide a project directory, the CLI will ask you for one. It will then prompt you to answer the following:

1. **What is your project named?** (if no folder name was supplied)
2. **Which package manager would you like to use?**
   - npm
   - yarn
   - pnpm
3. **Which database would you like to use?**
   - MongoDB (Mongoose)
   - PostgreSQL (Sequelize)
   - None

### After Setup

Once the tool has finished scaffolding the project and installing dependencies, you can navigate into your new app and start the development server:

```bash
cd <your-project-directory>
npm run dev
```
*(Replace `npm` with your chosen package manager!)*
