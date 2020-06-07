const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');

try {
  const urlToHit = core.getInput('url-to-hit');
  const telegramToken = core.getInput('telegram-token');
  const telegramTo = core.getInput('telegram-to');
  const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${telegramTo}&parse_mode=Markdown&text=`
  
  const expectedStatuses = core.getInput('expected-statuses').split(",").map((status) => Number(status)) ;
  console.log(`Pinging ${urlToHit} and expecting ${expectedStatuses}`);

  https.get(urlToHit, (resp) => {
    if (!expectedStatuses.includes(resp.statusCode)) {
      core.setFailed(`Request status was ${resp.statusCode}`);
      console.log(`Sending msg to telegram`);
      https.get(telegramUrl, (resp) => {
        let tele_status = resp.statusCode
        if (tele_status == 200) {
          console.log(`Sent msg to telegram`);
        } else {
          console.log(`Failed to send msg to telegram, statusCode: ${tele_status} :`);
          console.log(resp);
        }
      }).on("error", (err) => {
        console.log(`Failed to send msg to telegram:`);
        console.log(err);
      })      
    } else {
      console.log(`Successful check`);
      core.setOutput("status", resp.statusCode);
    }
  }).on("error", (err) => {
    console.log(`Request failed`);
    core.setFailed(err.message);
  })
} catch (error) {
  core.setFailed(error.message);
}
