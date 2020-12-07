exports.default = {
    authorizer: "${file(./aws/envs/${opt:aws_envs, 'local'}.yml):authorizer}"
}