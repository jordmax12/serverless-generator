exports.default = {
    environment: {
       APP_NAME: "${self:service}",
       SERVICE: "${self:service}",
       STACK: "${self:provider.stackTags.name}",
       STAGE: "${self:provider.stage}",
       // TODO: put this in the CLI and make them give us one, put it in the serverless file, and default to us-east-2
       REGION: "${self:provider.region}",
    },
    authorizer: {
       arn: false,
       name: false,
       type: false,
       identitySource: false,
       resultTtlInSeconds: false
    },
    cors: {
       origin: "*",
       allowCredentials: false,
       headers: [
          "Content-Type",
          "x-master-key",
          "x-api-key",
          "x-user-token"
       ]
    }
    // arn: {
    //    sns: "arn:aws:sns:*:*:local-platform-model-revisions"
    // }
 }