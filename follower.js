/**
 * get Followers
 */
require('dotenv').config();
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const { GH_TOKEN: githubToken } = process.env;

(async () => {
  try {
    const readmeData = fs.readFileSync(`${__dirname}/README.md`, 'utf8');
    const startWords = '<!--START_SECTION:followers-->';
    const endWords = '<!--END_SECTION:followers-->';
    const startIndex = readmeData.search(startWords) + startWords.length;
    const endIndex = readmeData.search(endWords);
    const startPart = readmeData.slice(0, startIndex);
    const endPart = readmeData.slice(endIndex);

    const getNewContent = (followers) => {
      let html = '';
      html += '\n<table>\n';
      followers.forEach((follower, index) => {
        const { avatar_url, login: name, id } = follower;
        if (index % 7 === 0) {
          if (index !== 0) {
            html += '  </tr>\n';
          }
          html += '  <tr>\n';
        }
        html += `<td align=\"center\">
              <a href="https://github.com/${name}">
                <img src="${avatar_url}" width="50px;" alt="${name}"/>
                </a>
              <br />
             <a href="https://github.com/${name}">${name}</a>
            </td>
            `;
      });
      html += '  </tr>\n</table>\n';
      const newContent = `${startPart}${html}${endPart}`;
      return newContent;
    };
    const octokit = new Octokit({ auth: `token ${githubToken}` });
    /**
     * login
     */
    await octokit.rest.users.getAuthenticated();
    /**
     * get followers
     */
    const followersRes =
      await octokit.rest.users.listFollowersForAuthenticatedUser({
        per_page: 100,
      });
    const { data: followers } = followersRes;
    const newContent = getNewContent(followers);
    fs.writeFileSync(`${__dirname}/README.md`, newContent);
  } catch (err) {
    console.error(`Unable to update followers \n${error}`);
  }
})();
