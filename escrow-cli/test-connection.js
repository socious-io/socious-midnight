#!/usr/bin/env node
// Test connectivity to Midnight services

async function testConnectivity() {
  console.log('Testing Midnight services connectivity...\n');

  const services = [
    { name: 'Node', url: 'http://localhost:9944/health' },
    { name: 'Indexer', url: 'http://localhost:8088/api/v1' },
    { name: 'Proof Server', url: 'http://localhost:6300' },
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      console.log(`✓ ${service.name}: Connected (${response.status})`);
    } catch (error) {
      console.log(`✗ ${service.name}: Not accessible - ${error.message}`);
      console.log(`  Make sure Docker containers are running:`);
      console.log(`  docker compose -f standalone.yml up -d`);
    }
  }
}

testConnectivity();
