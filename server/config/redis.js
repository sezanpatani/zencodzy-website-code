import { Redis } from '@upstash/redis';
import 'dotenv/config';

let redisClient;

const connectRedis = () => {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            console.warn('⚠️  Redis credentials missing in environment variables.');
            return null;
        }

        if (!redisClient) {
            redisClient = Redis.fromEnv();
            console.log('✅ Redis connected successfully');
        }
        return redisClient;
    } catch (error) {
        console.error('❌ Redis Connection Error:', error);
        return null;
    }
};

export const getRedisClient = () => {
    if (!redisClient) {
        return connectRedis();
    }
    return redisClient;
};
