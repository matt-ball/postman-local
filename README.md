# Postman CLI

A client to facilitate local development of scripts for Postman.

## About

Allows for editing of Postman Scripts inside your chosen editor, without having to deal with JSON structures and importing/exporting collections from Postman.

Using `require` works within these scripts as Browserify will run whenever you run the `postman sync` command. This means you can reuse local files as well as pull in external modules from NPM as they will all be bundled automaticaly when you sync.

## Installation

`npm i -g @matt-ball/postman-cli`

## Configuration

Run `postman setup` within the root directory of your project to setup a Postman CLI config.

See the Postman Learning Center for [details on creating an API key](https://learning.getpostman.com/docs/postman/postman-api/intro-api/).

## Usage

Run the `postman` command from the root directory of your repo.

### `postman bootstrap`

Retrieves a collection and converts its scripts to editable files. One-time setup for a repo.

### `postman clone`

Copies the collection to `My Workspace` in Postman for testing. Useful when cloning others branches.

### `postman env`

Fetch an environment from Postman to use locally.

### `postman sync`

Converts the files created with `postman bootstrap` back to the Postman collection format. Use before pushing changes.

### `postman update`

Updates the collection within Postman with local changes. Useful for CI/CD.

## Getting started

1. From the root of your Git repo:  
`postman bootstrap`  

2. Enter your API key and the appropriate workspace/collection for the project you're working on.

Done!

## Example workflow

1. Open a new branch:  
`git checkout -b shiny-new-feature`  

2. Make code changes:  
`git add src/`  
`git commit -m 'update api code'`  

3. Sync to Postman collection format:  
`postman sync`  

4. Add and commit changes:  
`git add postman-tests/`  
`git commit -m 'update api tests'`  

5. Run Newman:  
`newman run postman_collection.json -e postman_environment.json`  

6. Push changes:  
`git push`  

7. PR opened, approved and merged, CD runs syncing Postman collection to Postman app:  
`postman update`  

## Other

Use `pm` instead of `postman` for extra speed.

Use `pm --help` to see all commands.
