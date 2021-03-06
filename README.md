# S3 Event Parser

[![npm version](https://badge.fury.io/js/%40digitregroup%2Fs3-event-parser.svg)](https://badge.fury.io/js/%40digitregroup%2Fs3-event-parser)
[![CircleCI](https://circleci.com/gh/digitregroup/s3-event-parser.svg?style=shield)](https://circleci.com/gh/digitregroup/s3-event-parser)
[![Coverage Status](https://coveralls.io/repos/github/digitregroup/s3-event-parser/badge.svg?branch=master)](https://coveralls.io/github/digitregroup/s3-event-parser?branch=master)

Parse AWS S3/SNS events from your Lambda function.

Notes: 
* This only work for single file S3 events. (One event per file).
* Work only in nodeJS v8.10 (because of JOI requirement)

## Install

```bash
npm i @digitregroup/s3-event-parser
# Or
yarn add @digitregroup/s3-event-parser
```

## Usage 

In your handler:

```js
const S3EventParser = require('@digitregroup/s3-event-parser')

module.exports.run = (event, context, callback) => {

  const parsedS3Event = new S3EventParser(event).parse();
  
  console.log(
    parsedS3Event.filePath,   // Cleaned full file path
    parsedS3Event.key,        // Raw file path
    parsedS3Event.filePrefix, // Key prefix (file path dirname)
    parsedS3Event.bucketName, // Bucket name
    parsedS3Event.fileSize    // File size in kb
    
    // Raw S3 event with all parsed and unparsed data
    parsedS3Event.rawS3Notification
  );
};
```

In you `serverless.yml`:
```yaml
functions:
  myFunction:
    handler: src/handlers/index.run
    events:
    
      # 1/ If you already have a S3 event subscriber in a SNS topic
      - sns:
          arn: arn:aws:sns:eu-west-1:0000000000:my-topic
          
      # 2/ If you want to create a S3 bucket and attach an event to this function
      - s3:
          bucket: photos
          event: s3:ObjectCreated:*
          
      # 3/ If already have a S3 bucket and just want to attach an event to this function
      - existingS3:
          bucket: photos
          event: s3:ObjectCreated:*

# Case 3/ requirement       
plugins:
 - serverless-external-s3-event
 
```


## Unit tests

This project aim to keep 100% code coverage. Tests are performed via Mocha/ChaiJS (Expect version).

```bash
  yarn lint
```


## Code style

This project should respect the linting configured in [@digitregroup/eslint-config](https://www.npmjs.com/package/@digitregroup/eslint-config).
```bash
  yarn lint
```

## DevOps
CI pipelines are performed in CircleCI for every single push in any branch.
CI is composed of Linting and Unit Testing with coverage requirement (specified in `package.json`)

CD pipeline is perfomed on git tag creation and release in NPM registry if the CI passed.

Note pipelines automaticaly check the `package.json`'s version to match with the git tag (or release/hotfix branch).


## Contributing

PR are welcome! We use gitflow :)
