exports.ddbTemplate = () => {
  return {
    Effect: 'Allow',
    Action: [
      'dynamodb:BatchGetItem',
      'dynamodb:BatchWriteItem',
      'dynamodb:DeleteItem',
      'dynamodb:DescribeTable',
      'dynamodb:DescribeTimeToLive',
      'dynamodb:GetItem',
      'dynamodb:GetRecords',
      'dynamodb:ListTables',
      'dynamodb:PutItem',
      'dynamodb:Query',
      'dynamodb:Scan',
      'dynamodb:UpdateItem',
      'dynamodb:UpdateTable',
      'dynamodb:GetShardIterator',
      'dynamodb:DescribeStream',
      'dynamodb:ListStreams'
    ],
    Resource: [
      'arn:aws:dynamodb:*:*:table/${self:provider.stackTags.name}-*',
      'arn:aws:dynamodb:*:*:table/${self:provider.stackTags.name}-*/index/*',
      'arn:aws:dynamodb:*:*:table/${self:provider.stackTags.name}-*/stream/*'
    ]
  }
}

exports.s3Template = (bucket_name) => {
  return {
    Effect: 'Allow',
    Action: [
      's3:*'
    ],
    Resource: [
      `arn:aws:s3:::\${self:provider.stackTags.name}-${bucket_name}/*`
    ]
  }
}

exports.snsTemplate = (arn) => {
  return {
    Effect: 'Allow',
    Action: [
      'SNS:Publish'
    ],
    Resource: [
      arn
    ]
  }
}

exports.sqsTemplate = (arn) => {
  return {
    Effect: 'Allow',
    Action: [
      'sqs:SendMessage',
      'sqs:ReceiveMessage'
    ],
    Resource: [
      arn
    ]
  }
}

exports.ssmTemplate = (api_name = '*') => {
  return {
    Effect: 'Allow',
    Action: [
      'ssm:*'
    ],
    Resource: [
      `arn:aws:ssm:\${self:provider.region}:*:parameter/\${self:provider.stackTags.name}/*`
    ]
  }
}