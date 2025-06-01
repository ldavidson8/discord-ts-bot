import { ClusterManager } from 'discord-hybrid-sharding';
import { availableParallelism } from 'node:os';
import env from './env.js';
import logger from './utils/logger.js';

try {
	console.clear();
} catch {
	null;
}

const manager = new ClusterManager(`./dist/client.js`, {
	respawn: true,
	mode: 'worker',
	totalShards: 'auto',
	token: env.DISCORD_TOKEN,
	totalClusters: availableParallelism(),
	restarts: { max: 10, interval: 10000 },
});

manager.on('clusterCreate', (cluster) => {
	logger.info(`[MANAGER] Cluster ${cluster.id} created successfully!`);
});

manager.on('clusterReady', (cluster) => {
	logger.start(`[MANAGER] Cluster ${cluster.id} has been started!`);
});

manager.on('debug', (data) => logger.debug(data));

manager.spawn({ timeout: -1 });
