const _supported_node_versions = [
    '12',
    '10'
];

const _supported_python_versions = [
    '3.8',
    '3.7',
    '3.6',
    '2.7'
];

const _supported_java_versions = [
    '11',
    '8'
];

const _map_runtime_object_to_runtime = (_runtime) => {
    const { runtime, runtime_version } = _runtime;
    let normalized_runtime = '';
    switch(runtime) {
        case 'node':
            switch(runtime_version) {
                case '12':
                    normalized_runtime = 'nodejs12.x';
                    break;
                case '10':
                    normalized_runtime = 'nodejs10.x';
                    break;
                default:
                    throw new Error('invalid runtime version for node.')
            }
            break;
        case 'python':
            switch(runtime_version) {
                case '3.8':
                    normalized_runtime = 'python3.8';
                    break;
                case '3.7':
                    normalized_runtime = 'python3.7';
                    break;
                case '3.6':
                    normalized_runtime = 'python3.6';
                    break;
                case '2.7':
                    break;
                default:
                    throw new Error('invalid runtime version for python.')
            }
            break;
        case 'java':
            switch(runtime_version) {
                case '11':
                    normalized_runtime = 'java11';
                    break;
                case '8':
                    normalized_runtime = 'java8.al2';
                    break;
                default:
                    throw new Error('invalid runtime version for java.')
            }
            break;
        default:
            throw new Error('invalid runtime.')
    }

    return normalized_runtime;
}

exports.versions_string = `\n\nnode: ${_supported_node_versions.join(', ')} (defaults to 12);\n\npython ${_supported_python_versions.join(', ')} (defaults to 3.8);\n\njava ${_supported_java_versions.join(', ')} (defaults to 11)`;
exports.node_versions_string = `\n\nnode: ${_supported_node_versions.join(', ')}`;
exports.python_versions_string = `\n\npython: ${_supported_python_versions.join(', ')}`;
exports.java_versions_string = `\n\njava: ${_supported_java_versions.join(', ')}`;
exports.supported_node_versions = _supported_node_versions;
exports.supported_python_versions = _supported_python_versions;
exports.supported_java_versions = _supported_java_versions;

exports.map_runtime_object_to_runtime = _map_runtime_object_to_runtime;