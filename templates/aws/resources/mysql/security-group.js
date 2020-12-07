const template = () => {
   return {
      Resources: {
         RDSSecurityGroup: {
            Type: "AWS::EC2::SecurityGroup",
            Properties: {
               GroupDescription: "Access to DB",
               VpcId: {
                  Ref: "RDSVPC"
               },
               SecurityGroupIngress: "${self:custom.security_group.${self:provider.stage}.rds.inbound}",
               Tags: [
                  {
                     Key: "Name",
                     Value: "${self:provider.stackTags.name}-rds"
                  }
               ]
            }
         }
      }
   }
}

exports.default = template;