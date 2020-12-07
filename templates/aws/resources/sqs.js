const { validResourceName } = require('../../../helpers/string');

exports.default = (queue_name, isFifo = false, includeDLQ = false, timeout = 30, maxRedriveReceiveCount = 5) => {
    const template = {
        [`${validResourceName(queue_name)}Queue`]: {
            Type: 'AWS::SQS::Queue',
            Properties: {
              QueueName: `\${self:provider.stackTags.name}-${queue_name}-sqs`,
              VisibilityTimeout: timeout
            }
        },
        [`${validResourceName(queue_name)}QueuePolicy`]:  {
            "Type": "AWS::SQS::QueuePolicy",
            "Properties": {
                "Queues": [
                    {
                        "Ref": `${validResourceName(queue_name)}Queue`
                    }
                ],
                "PolicyDocument": {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": [
                            "sqs:CreateQueue",
                            "sqs:DeleteMessage",
                            "sqs:DeleteQueue",
                            "sqs:GetQueueUrl",
                            "sqs:ListQueues",
                            "sqs:ReceiveMessage",
                            "sqs:SendMessage"
                        ],
                        "Resource": {
                            "Fn::GetAtt": [
                                `${validResourceName(queue_name)}Queue`,
                                "Arn"
                            ]
                        }
                        }
                    ]
                }
            }
        }
    }

    if(includeDLQ) {
        template[`${validResourceName(queue_name)}Queue`].Properties.RedrivePolicy = {
            deadLetterTargetArn: {
                'Fn::GetAtt': [ `${validResourceName(queue_name)}QueueDLQ`, 'Arn' ]
            },
            maxReceiveCount: maxRedriveReceiveCount
        }

        template[`${validResourceName(queue_name)}QueueDLQ`] = {
            Type: 'AWS::SQS::Queue',
            Properties: {
              QueueName: `\${self:provider.stackTags.name}-${queue_name}-sqs-dlq`,
              VisibilityTimeout:  timeout
            }
        }
    }

    return template;
}