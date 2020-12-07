exports.defaults = {
    name: 'aws',
    runtime: 'nodejs12.x',
    logRetentionInDays: 14,
    versionFunctions: false,
    endpointType: 'regional',
    environment: '${self:custom.environment}',
    stage: '${opt:stage, \'local\'}',
    profile: '${opt:stage, \'local\'}',
    region: '${opt:region, \'us-east-2\'}',
    stackName: '${self:provider.stackTags.name}',
    apiName: '${self:provider.stackTags.name}',
    deploymentBucket: {
        name: '${self:provider.stage}-default-deployments'
    },
    deploymentPrefix: '${self:provider.stackTags.name}',
    stackTags: {
        name: '${self:provider.stage}-${self:service}',
        service: '${self:service}',
        environment: '${self:provider.stage}',
        ['managed-by']: 'serverless'
    },
    iamManagedPolicies: [
        'arn:aws:iam::aws:policy/AmazonESFullAccess'
    ],
    iamRoleStatements: []
}