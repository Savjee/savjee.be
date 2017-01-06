node {
    checkout scm

    // stage('Inject Google Analytics') {
    //     withCredentials([string(credentialsId: 'Savjee.be-Analytics', variable: 'analyticsid')]) {
    //         writeFile file: '_includes/google-analytics.html', text: '''
    //             <script type='text/javascript'>
    //                 // Google Analytics
    //                 (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    //                 (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    //                 m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    //                 })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    //                 ga('create', '${whoAreYou}', 'savjee.be');
    //                 ga('send', 'pageview');
    //             </script>
    //         '''
    //     }
// 
    // withCredentials([file(credentialsId: secret, variable: FILE)]) { 
    //  dir(subdir) { sh use $FILE } }        
    // }

    stage('Running Jekyll') {
        sh 'jekyll build'
    }

    stage('Deploy to AWS') {
        withCredentials([usernamePassword(credentialsId: 'savjee.be-aws', passwordVariable: 'AWS_SECRET', usernameVariable: 'AWS_ID')]) {
            sh 's3_website push'
        }
        
    }
}