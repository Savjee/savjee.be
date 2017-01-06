node {
    checkout scm

    stage('Inject Google Analytics') {
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

    stage('Deploy to AWS') {
        withCredentials([usernamePassword(credentialsId: 'savjee.be-aws', passwordVariable: 'S3_SECRET', usernameVariable: 'S3_ID')]) {
            sh 's3_website push'
        }
        
    }
}