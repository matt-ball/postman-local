# Postman CLI

A client to facilitate local development of scripts for Postman

## About

Allows for editing of Postman Scripts inside your chosen editor, without having to deal with JSON structures and importing/exporting collections from Postman.

Using `require` works within these scripts as Browserify will run whenever you run the `postman sync` command. This means you can reuse local files as well as pull in external modules from NPM as they will all be bundled automaticaly when you sync.

## Installation

`npm i -g postman-cli`

## Configuration

Run `postman setup` within the root directory of your project to setup a Postman CLI config.

See the Postman Learning Center for [details on creating an API key](https://learning.getpostman.com/docs/postman/postman-api/intro-api/).

## Usage

### `postman bootstrap`

Will retrieve your collection via the Postman API and convert all your scripts to editable files.

### `postman sync`

Convert the files created with `postman bootstrap` back to the Postman Collection format.

### `postman update`

Updates the collection within Postman via Postman API with your local changes.

## Other

Use `pm` instead of `postman` for extra speed.

Use `pm --help` to see all commands.
