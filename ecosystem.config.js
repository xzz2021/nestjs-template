module.exports = {
  apps: [
    {
      name: 'nest-app',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork', // 或 'cluster'
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
