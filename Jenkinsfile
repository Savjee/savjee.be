node {
    try{
        checkout scm

        stage('Inject Google Analytics') {
            slackSend channel: 'jenkins', message: "Started ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)", teamDomain: 'savjee', tokenCredentialId: 'slack-savjee'

            withCredentials([string(credentialsId: 'savjee.be-googleanalytics-id', variable: 'analyticsid')]) {
                dir('_includes') {
                    sh 'echo ${analyticsid}'
                    sh "sed -i -e 's/UA-XXXXXXXX-X/${analyticsid}/g' google-analytics.html"
                }
            }       
        }

        stage('Running Jekyll') {
            sh 'jekyll build'
        }

        stage('html-proofer') {
            dir('_scripts') {
                sh 'ruby html-proofer.rb'
            }
        }

        stage('Deploy to AWS') {
            withCredentials([
                usernamePassword(credentialsId: 'savjee.be-aws', passwordVariable: 'S3_SECRET', usernameVariable: 'S3_ID'),
                string(credentialsId: 'savjee.be-cloudfront-id', variable: 'CLOUDFRONT_DISTRIBUTION_ID')
            ]) {
                sh 's3_website push'
            }
            
            slackSend channel: 'jenkins', color: 'good', message: "Finished ${env.JOB_NAME} ${env.BUILD_NUMBER}", teamDomain: 'savjee', tokenCredentialId: 'slack-savjee'
        }
    }catch(e){
        slackSend channel: 'jenkins', color: 'danger', message: "FAILED ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)", teamDomain: 'savjee', tokenCredentialId: 'slack-savjee'
    }
    
}