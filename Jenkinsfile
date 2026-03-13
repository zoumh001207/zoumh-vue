pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        string(name: 'NODE_BUILD_CMD', defaultValue: 'npm ci --cache "$NPM_CACHE_DIR" --prefer-offline && npm run build:prod', description: 'Frontend build command')
        booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy to remote server')
        choice(name: 'DEPLOY_MODE', choices: ['local', 'ssh'], description: 'Deploy to local Jenkins server or remote SSH host')
        string(name: 'DEPLOY_DIR', defaultValue: '/zoumh/java/zmh/frontend', description: 'Remote frontend artifact directory')
        string(name: 'NGINX_HTML_DIR', defaultValue: '/zoumh/data/nginx/www', description: 'Nginx static site directory')
        string(name: 'DEPLOY_SCRIPT_DIR', defaultValue: '/zoumh/java/zmh/frontend/bin', description: 'Remote frontend script directory')
        string(name: 'SSH_HOST', defaultValue: '156.225.28.110', description: 'Deploy host when DEPLOY_MODE=ssh')
        string(name: 'SSH_USER', defaultValue: 'root', description: 'Deploy user when DEPLOY_MODE=ssh')
        string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'zoumh-ssh', description: 'SSH credentials id in Jenkins')
        string(name: 'NPM_CACHE_DIR', defaultValue: '${JENKINS_HOME}/caches/npm', description: 'Persistent npm cache directory')
        string(name: 'POST_DEPLOY_CMD', defaultValue: '', description: 'Optional command after frontend files are extracted')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Cache') {
            steps {
                sh '''
                    set -e
                    mkdir -p "${NPM_CACHE_DIR}"
                '''
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
                            mkdir -p "${DEPLOY_DIR}" "${NGINX_HTML_DIR}" "${DEPLOY_SCRIPT_DIR}"
                            cp -f frontend-dist.tgz "${DEPLOY_DIR}/frontend-dist.tgz"
                            cp -f scripts/deploy-frontend-host.sh "${DEPLOY_SCRIPT_DIR}/deploy-frontend-host.sh"
                            chmod +x "${DEPLOY_SCRIPT_DIR}/deploy-frontend-host.sh"
                            ARCHIVE_PATH="${DEPLOY_DIR}/frontend-dist.tgz" HTML_DIR="${NGINX_HTML_DIR}" POST_DEPLOY_CMD="${POST_DEPLOY_CMD}" "${DEPLOY_SCRIPT_DIR}/deploy-frontend-host.sh"
                        '''
                    } else {
                        sshagent(credentials: [params.SSH_CREDENTIALS_ID]) {
                            sh '''
                                set -e
                                ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "mkdir -p ${DEPLOY_DIR} ${NGINX_HTML_DIR} ${DEPLOY_SCRIPT_DIR}"
                                scp -o StrictHostKeyChecking=no frontend-dist.tgz ${SSH_USER}@${SSH_HOST}:${DEPLOY_DIR}/frontend-dist.tgz
                                scp -o StrictHostKeyChecking=no scripts/deploy-frontend-host.sh ${SSH_USER}@${SSH_HOST}:${DEPLOY_SCRIPT_DIR}/deploy-frontend-host.sh
                                ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "chmod +x ${DEPLOY_SCRIPT_DIR}/deploy-frontend-host.sh && ARCHIVE_PATH=${DEPLOY_DIR}/frontend-dist.tgz HTML_DIR=${NGINX_HTML_DIR} POST_DEPLOY_CMD='${POST_DEPLOY_CMD}' ${DEPLOY_SCRIPT_DIR}/deploy-frontend-host.sh"
                            '''
                        }
                    }
                }
            }
        }
    }
}
