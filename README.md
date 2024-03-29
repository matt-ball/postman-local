# Postman Local

A client to facilitate local development of requests, responses and scripts for Postman.

This functionality should be considered pre-alpha/early access. Use caution around production systems and anticipate breaking changes throughout this period.

## About

Allows for editing of Postman requests, responses and scripts inside your chosen editor. For scripts, this has a few additional benefits:

- Work with JavaScript files instead of the Postman collection JSON structure
- Use of `require` to include local files/libraries from NPM (you must `npm install`) not otherwise available in Postman's sandbox 
- Version control your Postman scripts alongside your API code

Note: due to the bundling process involved in including additional libraries, this CLI does not provide a "best of both worlds", where you can edit your scripts in both the Postman app or the IDE. If you'd like to continue to edit scripts in Postman, check out how to use Postman's own [version control](https://learning.postman.com/docs/collaborating-in-postman/version-control-for-collections/).

## Installation

Node version 10.12 or higher is required.

`npm i -g postman-local`

## Configuration

Run `postman setup` within the root directory of your project to setup a Postman Local config.

See the Postman Learning Center for [details on creating an API key](https://learning.getpostman.com/docs/postman/postman-api/intro-api/).

## Usage

Run the `postman` command from the root directory of your repo.

### `postman bootstrap`

Converts a collections requests, responses and scripts to JSON/JavaScript files, placed in the directory specified during `postman setup`. Run this command whenever adding requests, responses or scripts on the Postman side - it will not update previously bootstrapped request, response or script files. It will also create a collection JSON file, and environment files too (if you selected some during `postman setup`). See more at [bootstrapping](#bootstrapping).

### `postman clone`

Creates both collection and environment(s) (if present) in `My Workspace` in Postman for testing. Will update pre-existing clones after running once. Useful when checking out others branches or before using `postman update` and updating the original resources.

### `postman setup`

Run for intial setup or later reconfiguration. Generates a `.postman.json` configuration file.

### `postman sync`

Converts the files created with `postman bootstrap` back to the Postman collection format (JSON). Use after making changes and before pushing to your VCS, running `postman clone` or `postman update`.

### `postman update`

Updates the original collection and any environment(s) in the Postman app with your local changes. Useful for CI/CD on merge to master - include your config/secrets `.postman.json` file (generated from `postman setup`) within this environment. _Note_: scripts in Postman will now include additional code through the Postman Local bundling process - it's easier to edit locally only at this point.

## Getting started

1. From the root of your repo:  
`postman bootstrap`  

2. Edit the files produced by Postman Local.

3. Sync the changes back to the Postman collection format:
`postman sync`

4. Run your changes through Newman locally, or feed the changes back into Postman via:
`postman update`

## Bootstrapping

Running `postman bootstrap` will create a number of files and folders in the directory you chose during `postman setup`. This will be reflective of the collection you are bootstrapping.

For example, a collection containing 2 requests named `Request A` and `Request B`, where `A` has a request and a test script defined, and `B` has a request, response and pre-request script defined the following following structure would be created:

<pre>
📦 repo
 ┣ 📂 postman
 ┃ ┣ 📂 Request A
 ┃ ┃ ┣ 📜 request.json
 ┃ ┃ ┗ 📜 test.js
 ┃ ┗ 📂 Request B
 ┃   ┣ 📜 request.json
 ┃   ┣ 📜 response.json
 ┃   ┗ 📜 prerequest.js
 ┣ 📜 postman_collection.json
 ┗ 📜 postman_environment.json
 </pre>

Once `postman bootstrap` has been run, running the command again will only serve to create new files/folders if new requests, responses or scripts have been made through the Postman app. It will not touch already bootstrapped files. You can add new elements by creating a `request.json`, `response.json`, `test.js` or `prerequest.js` file yourself.

Finally, `postman bootstrap` will create a collection JSON file for your convenience. This can be kept in sync with changes to files in the `postman` directory by running `postman sync`. Environment file(s) will also be created if they exist and are optioned during `postman setup`. Should you wish to add environments at a later date, run `postman setup` again.

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
`echo ${{ secrets.postmanLocal }} > .postman.json`  
`postman update`  

## Other

Use `pm` instead of `postman` for extra speed.

Use `pm --help` to see all commands.
