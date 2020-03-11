# Postman CLI

A client to facilitate local development of requests, responses and scripts for Postman.

This functionality should be considered pre-alpha/early access. Use caution around production systems and anticipate breaking changes throughout this period.

## About

Allows for editing of Postman requests, responses and scripts inside your chosen editor. For scripts, this has a few additional benefits:

- Work with JavaScript files instead of the Postman collection JSON structure
- Use of `require` to include local files/libraries from NPM (you must `npm install`) not otherwise available in Postman's sandbox 
- Version control your Postman scripts alongside your API code

## Installation

Node version 10.12 or higher is required.

`npm i -g @matt.ball/postman-cli`

## Configuration

Run `postman setup` within the root directory of your project to setup a Postman CLI config.

See the Postman Learning Center for [details on creating an API key](https://learning.getpostman.com/docs/postman/postman-api/intro-api/).

## Usage

Run the `postman` command from the root directory of your repo.

### `postman bootstrap`

Retrieves a collections requests/responses and converts their scripts to JavaScript files. Run this command whenever adding new requests on the Postman side - it will not convert previously bootstrapped requests.

### `postman clone`

Creates both collection and environment (if present) in `My Workspace` in Postman for testing. Will update pre-existing clones after running once. Useful when checking out others branches.

### `postman env`

Fetch an environment from Postman to use locally.

### `postman setup`

Run for intial setup. Generates a `.postman.json` configuration file.

### `postman sync`

Converts the files created with `postman bootstrap` back to the Postman collection format. Use after making changes and before pushing to your VCS, running `postman clone` or `postman update`.

### `postman update`

Updates the collection in Postman with local changes. Useful for CD on merge to master - include your config/secrets `.postman.json` file (generated from `postman setup`) within this environment.

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

3. Update Postman test scripts, sync to Postman collection format:  
`postman sync`  

4. Validate tests in personal workspace in Postman:  
`postman clone`  

5. Add, commit, push changes:  
`git add postman/`  
`git add postman_collection.json`  
`git commit -m 'update api tests'`  
`git push`  

6. PR opens, CI runs Newman:  
`newman run postman_collection.json -e postman_environment.json`  

7. PR approved and merged, CD runs the following, updating Postman collection to Postman app:  
`echo ${{ secrets.postmanCli }} > .postman.json`  
`postman update`  

## Other

Use `pm` instead of `postman` for extra speed.

Use `pm --help` to see all commands.
