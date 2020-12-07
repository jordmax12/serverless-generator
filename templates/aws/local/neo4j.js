exports.default = {
    version: "3",
    services: {
        neo4j: {
            image: "neo4j:3.5.3-enterprise",
            restart: "unless-stopped",
            hostname: "neo4j",
            container_name: "neo4j",
            ports: [
                "7474:7474",
                "7687:7687"
            ],
            volumes: [
                "./.neo4j/conf:/conf",
                "./.neo4j/logs:/logs",
                "./.neo4j/plugins:/plugins",
                "./.neo4j/data:/data",
                "./.neo4j/import:/import"
            ],
            environment: [
                "NEO4J_dbms_memory_pagecache_size=1G",
                "NEO4J_dbms.memory.heap.initial_size=1G",
                "NEO4J_dbms_memory_heap_max__size=1G",
                "NEO4J_ACCEPT_LICENSE_AGREEMENT=yes",
                "NEO4J_AUTH=neo4j/password"
            ]
        }
    }
}