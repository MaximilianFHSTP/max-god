module.exports = {
    apps: [
        {
            name:"Max-GoD",
            script: "dist/index.js",
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ],
    deploy: {
        production: {
            user: 'prod',
            host: 'god.meeteux.fhstp.ac.at',
            ref: 'origin/master',
            repo: "https://github.com/MaximilianFHSTP/max-god.git",
            path: '/srv/production',
            'post-deploy': 'cp ../.env ./ && npm install && npm run tsc && pm2 startOrRestart ecosystem.config.js --env production',
            'pre-deploy': 'git reset --hard'
        },
        develop: {
            user: 'node',
            host: 'god.meeteux.fhstp.ac.at',
            ref: 'origin/develop',
            repo: "https://github.com/MaximilianFHSTP/max-god.git",
            path: '/srv/develop',
            'post-deploy': 'cp ../.env ./ && npm install && npm run tsc && pm2 startOrRestart ecosystem.config.js --env production',
            'pre-deploy': 'git reset --hard'
        }
    }
};
