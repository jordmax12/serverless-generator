exports.packagejson = (name = 'name-wasnt-provided') => {
    return {
        name,
        version: "1.0.0",
        description: "",
        scripts: {
            lint: "eslint application/**",
            sct: "sct",
            report: "nyc report",
            test: "unittest=true nyc mocha --recursive"
        },
        author: "",
        license: "ISC",
        dependencies: {
            'aws-sdk': "^2.753.0",
            esformatter: "^0.11.3",
            fs: "0.0.1-security",
            'js-yaml': "^3.14.0",
            path: "^0.12.7"
        },
        devDependencies: {
            chai: "^4.2.0",
            concurrently: "^5.2.0",
            eslint: "^7.6.0",
            'eslint-config-airbnb': "^18.0.1",
            'eslint-config-prettier': "^6.11.0",
            'eslint-plugin-import': "^2.20.0",
            'eslint-plugin-jsx-a11y': "^6.2.3",
            'eslint-plugin-node': "^11.0.0",
            'eslint-plugin-prettier': "^3.1.2",
            'eslint-plugin-react': "^7.20.0",
            mocha: "~8.1.1",
            'mocha-junit-reporter': "^2.0.0",
            'mocha-multi-reporters': "^1.1.7",
            mochawesome: "^6.1.1",
            prettier: "^2.0.5",
            serverless: "^2.15.0",
            'serverless-dynamodb-local': "^0.2.39",
            'serverless-offline': "^6.8.0",
            'serverless-plugin-bind-deployment-id': "~1.2.0",
            "serverless-deployment-bucket": "^1.2.0",
            "serverless-pseudo-parameters": "^2.5.0",
            nyc: "^15.1.0"
        },
        nyc: {
            'temp-directory': "./node_modules/.test-metadata/.nyc_output"
        },
        engines: {
            node: ">=12.14.1"
        },
        eslintConfig: {
            env: {
                es6: true
            },
            parserOptions: {
                ecmaVersion: 2018
            },
            plugins: [
                "prettier"
            ],
            extends: [
                "airbnb",
                "plugin:prettier/recommended"
            ],
            rules: {
                'prettier/prettier': [
                    "warn",
                    {
                        trailingComma: "none",
                        printWidth: 120,
                        tabWidth: 4,
                        singleQuote: true,
                        bracketSpacing: false,
                        arrowParens: "always"
                    }
                ],
                eqeqeq: "error",
                'no-console': 0,
                'guard-for-in': 0,
                'no-await-in-loop': 0,
                'no-restricted-syntax': 0,
                'no-underscore-dangle': 0,
                camelcase: 0,
                'global-require': 0,
                'no-throw-literal': 0,
                'no-param-reassign': 0,
                'class-methods-use-this': 0,
                'no-use-before-define': 0,
                'no-plusplus': 0,
                'no-undef': 0
            }
        }
    }
}