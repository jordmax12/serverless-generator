# serverless-generator
CLI tool to generate resources and environments needed to build a serverless project.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init`](https://docs.npmjs.com/creating-a-package-json-file) command.

Installation is done using the
[`npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) command:

```NPM
$ npm install @npmpackageschicago/serverless-generator
```

OR

```NPX
$ npx -p @npmpackageschicago/serverless-generator -c 'serverless-generator'
```

## Contributing

Please lint and add unit tests.
To run unit tests, please do the following:

0. Have Docker Installed
1. run `npm install`
3. run `npm test` 
4. Happy Coding :)

## Known Issues

- This is assuming we have a cloudwatch log arn defined in APIGateway, as long as you have this in one, it should be fine.
However,  if this is a new account and you never have setup APIGateway before, deploy can fail because of no Cloudwatch ARN.
In the future, we can ask the user if they would like to have cloudwatch setup and disable it if they say no. 