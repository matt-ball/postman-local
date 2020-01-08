# Postman CLI

A client to facilitate local development of scripts for Postman.

## About

Allows for editing of Postman Scripts inside your chosen editor. This has a few additional benefits:

- Work with JavaScript files instead of the Postman collection JSON structure
- Use of `require` to include local files/libraries from NPM (you must `npm install`) not otherwise available in Postman's sandbox 
- Version control your Postman scripts alongside your API code

## Installation

`npm i -g @matt-ball/postman-cli`

## Configuration

Run `postman setup` within the root directory of your project to setup a Postman CLI config.

See the Postman Learning Center for [details on creating an API key](https://learning.getpostman.com/docs/postman/postman-api/intro-api/).

## Usage

Run the `postman` command from the root directory of your repo.

### `postman bootstrap`

Retrieves a collection and converts its scripts to JavaScript files. Run this command whenever adding new scripts on the Postman side - it will not convert previously bootstrapped scripts.

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

3. Retrieve the appropriate Postman environment:
`postman env`

Done!

## Example workflow

1. Open a new branch:  
`git checkout -b shiny-new-feature`  

2. Make code changes:  
`git add src/`  
`git commit -m 'update api code'`  

3. Sync to Postman collection format:  
`postman sync`  
`git add postman_collection.json`  

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
