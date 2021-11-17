# Basic Frontend Build

## Prerequisite

- Needs nodejs >=16: https://nodejs.org/en/download/
- Global installed yarn

  npm i -g yarn

## Install

    yarn

## Build project

Unminified:

    yarn run build-dev

Minified:

    yarn run build

Develop/Serve:

    yarn run serve

## Use Project

Start with

    yarn run serve

- 'src' folder is for project specific code
    - html entrypoint are all files like '_*.hbs'. These are [Handlebars templates](https://handlebarsjs.com/guide/).
      Partials like '*
      .hbs'. [Layouts are supported](https://github.com/shannonmoeller/handlebars-layouts).
    - 'src/js' all javascript files concatenated, ordered by filename. So a numeric prefix like 050_hello.js is
      recommended.
    - 'src/css' all css/scss/sass files that starts with '_' are entry points. Other files are ignored and have to be
      included from entry files. The leading underscore char will be removed from filename.
- 'src-vendor' is fpr 3rd party stuff like jquery
    - same as 'src' folder except one thing: no hbs templates are available  