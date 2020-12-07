const { validResourceName } = require('../../../helpers/string');

exports.bucket = (bucket_name) => {
    return  {
        Type: 'AWS::S3::Bucket',
        Properties: {
            BucketName: `\${self:provider.stackTags.name}-${bucket_name.toLowerCase()}-storage`,
            CorsConfiguration: {
                CorsRules: [
                    {
                        AllowedMethods: ['GET'],  
                        AllowedOrigins: ["*"]
                    }
                ]
            }
        }
    }
}

exports.public_policy = (bucket_name) => {
    const _resource = `arn:aws:s3:::\${self:provider.stackTags.name}-${bucket_name.toLowerCase()}-storage/*`;
    return {
            Type: 'AWS::S3::BucketPolicy',
            Properties: {
                Bucket: {
                    Ref: `${validResourceName(bucket_name)}Storage`
                },
                PolicyDocument: {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: 'Allow',
                            Action: [
                                "s3:GetObject",
                                "s3:GetObjectAcl"
                            ],
                            Resource: _resource,
                            Principal: "*"
                        }
                    ]
                }
            }
    }
}

exports.website = (bucket_name) => {

}