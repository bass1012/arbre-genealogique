module.exports = {
  apps: [{
    name: 'arbre-genealogique',
    script: './server/dist/index.js',
    cwd: '/var/www/arbre-genealogique',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/arbre-genealogique/error.log',
    out_file: '/var/log/arbre-genealogique/out.log',
    log_file: '/var/log/arbre-genealogique/combined.log',
    time: true
  }]
};
