const { validResourceName } = require('../../../helpers/string');


exports.topic = (topic_name, dedup = false) => {
    const template = {
      Type: "AWS::SNS::Topic",
      Properties: {
         DisplayName: topic_name.charAt(0).toUpperCase() + topic_name.slice(1),
         TopicName: `\${self:provider.stage}-${topic_name}`
      }
    }

    return template;
}

exports.subscription = (topic_name, sqs_queue_name) => {
    const template = {
        Type: "AWS::SNS::Subscription",
        Properties: {
           Protocol: "sqs",
           Endpoint: {
              'Fn::GetAtt': [
                 `${validResourceName(sqs_queue_name)}Queue`,
                 "Arn"
              ]
           },
           Region: "${self:provider.region}",
           TopicArn: `!Ref ${validResourceName(topic_name)}Topic`,
           RawMessageDelivery: true
        }
    }

    return template;
}