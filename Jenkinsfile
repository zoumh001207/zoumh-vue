pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        string(name: 'NODE_BUILD_CMD', defaultValue: 'npm ci && npm run build:prod', description: 'Frontend build command')
        booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy to remote server')
        choice(name: 'DEPLOY_MODE', choices: ['local', 'ssh'], description: 'Deploy to local Jenkins server or remote SSH host')
        string(name: 'DEPLOY_DIR', defaultValue: '/zoumh/java/zmh/frontend', description: 'Remote frontend artifact directory')
        string(name: 'NGINX_HTML_DIR', defaultValue: '/zoumh/java/zmh/www', description: 'Nginx static site directory')
        string(name: 'SSH_HOST', defaultValue: 'your.server.ip', description: 'Deploy host when DEPLOY_MODE=ssh')
        string(name: 'SSH_USER', defaultValue: 'root', description: 'Deploy user when DEPLOY_MODE=ssh')
        string(name: 'POST_DEPLOY_CMD', defaultValue: 'systemctl reload nginx', description: 'Optional command after files are copied')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -e
                    eval "${NODE_BUILD_CMD}"
                    tar -czf frontend-dist.tgz -C dist .
                '''
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'frontend-dist.tgz,dist/**', fingerprint: true
            }
        }

        stage('Deploy') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                script {
                    if (params.DEPLOY_MODE == 'local') {
                        sh '''
                            set -e
                            mkdir -p "${DEPLOY_DIR}" "${NGINX_HTML_DIR}"
                            cp -f frontend-dist.tgz "${DEPLOY_DIR}/frontend-dist.tgz"
                            find "${NGINX_HTML_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
                            tar -xzf "${DEPLOY_DIR}/frontend-dist.tgz" -C "${NGINX_HTML_DIR}"
                            if [ -n "${POST_DEPLOY_CMD}" ]; then
                                sh -c "${POST_DEPLOY_CMD}"
                            fi
                        '''
                    } else {
                        sshagent(credentials: ['zoumh-ssh']) {
                            sh '''
                                set -e
                                ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "mkdir -p ${DEPLOY_DIR} ${NGINX_HTML_DIR}"
                                scp -o StrictHostKeyChecking=no frontend-dist.tgz ${SSH_USER}@${SSH_HOST}:${DEPLOY_DIR}/frontend-dist.tgz
                                ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "rm -rf ${NGINX_HTML_DIR}/* && tar -xzf ${DEPLOY_DIR}/frontend-dist.tgz -C ${NGINX_HTML_DIR}"
                                if [ -n "${POST_DEPLOY_CMD}" ]; then
                                    ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "${POST_DEPLOY_CMD}"
                                fi
                            '''
                        }
                    }
                }
            }
        }
    }
}
