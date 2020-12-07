const template = () => {
   return {
      groups: {
         dev: {
            // rds: {
            //    inbound: [
            //       {
            //          SourceSecurityGroupId: {
            //             Ref: "LambdaSecurityGroup"
            //          },
            //          IpProtocol: "tcp",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       },
            //       {
            //          IpProtocol: "tcp",
            //          CidrIp: "0.0.0.0/0",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       }
            //    ]
            // },
            lambda: {
               inbound: [
                  {
                     IpProtocol: "tcp",
                     CidrIp: "0.0.0.0/0",
                     FromPort: 443,
                     ToPort: 443
                  }
               ],
               outbound: [
                  {
                     IpProtocol: -1,
                     CidrIp: "0.0.0.0/0",
                     FromPort: -1,
                     ToPort: -1
                  }
               ]
            }
         },
         qa: {
            // rds: {
            //    inbound: [
            //       {
            //          SourceSecurityGroupId: {
            //             Ref: "LambdaSecurityGroup"
            //          },
            //          Description: "Lambda access to DB",
            //          IpProtocol: "tcp",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       },
            //       {
            //          IpProtocol: "tcp",
            //          CidrIp: "0.0.0.0/0",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       }
            //    ]
            // },
            lambda: {
               inbound: [
                  {
                     IpProtocol: "tcp",
                     CidrIp: "0.0.0.0/0",
                     FromPort: 443,
                     ToPort: 443
                  }
               ],
               outbound: [
                  {
                     IpProtocol: -1,
                     CidrIp: "0.0.0.0/0",
                     FromPort: -1,
                     ToPort: -1
                  }
               ]
            }
         },
         uat: {
            // rds: {
            //    inbound: [
            //       {
            //          SourceSecurityGroupId: {
            //             Ref: "LambdaSecurityGroup"
            //          },
            //          Description: "Lambda access to DB",
            //          IpProtocol: "tcp",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       },
            //       {
            //          IpProtocol: "tcp",
            //          CidrIp: "0.0.0.0/0",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       }
            //    ]
            // },
            lambda: {
               inbound: [
                  {
                     IpProtocol: "tcp",
                     CidrIp: "0.0.0.0/0",
                     FromPort: 443,
                     ToPort: 443
                  }
               ],
               outbound: [
                  {
                     IpProtocol: -1,
                     CidrIp: "0.0.0.0/0",
                     FromPort: -1,
                     ToPort: -1
                  }
               ]
            }
         },
         prod: {
            // rds: {
            //    inbound: [
            //       {
            //          SourceSecurityGroupId: {
            //             Ref: "LambdaSecurityGroup"
            //          },
            //          Description: "Lambda access to DB",
            //          IpProtocol: "tcp",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       },
            //       {
            //          IpProtocol: "tcp",
            //          CidrIp: "0.0.0.0/0",
            //          FromPort: 3306,
            //          ToPort: 3306
            //       }
            //    ]
            // },
            lambda: {
               inbound: [
                  {
                     IpProtocol: "tcp",
                     CidrIp: "0.0.0.0/0",
                     FromPort: 443,
                     ToPort: 443
                  }
               ],
               outbound: [
                  {
                     IpProtocol: -1,
                     CidrIp: "0.0.0.0/0",
                     FromPort: -1,
                     ToPort: -1
                  }
               ]
            }
         }
      }
   }
}

exports.default = template;