// from https://github.com/segmentio/is-url
/**
 * RegExps.
 * A URL must match #1 and then at least one of #2/#3.
 * Use two levels of REs to avoid REDOS.
 */

const protocolAndDomainRE = /^(?:\w+:)?\/\/([\s\S]+)$/;

const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d][\s\S]*)?$/;
const nonLocalhostDomainRE = /^[^\s\.]+\.[\s\S]{2,}$/;

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */

export function isUrl(string) {
  if (typeof string !== "string") {
    return false;
  }

  var match = string.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  var everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (
    localhostDomainRE.test(everythingAfterProtocol) ||
    nonLocalhostDomainRE.test(everythingAfterProtocol)
  ) {
    return true;
  }

  return false;
}

//from: https://github.com/github-modules/github-url-to-object/blob/master/index.js
const laxUrlRegex = /(?:(?:[^:]+:)?[/][/])?(?:.+@)?([^/]+)([/][^?#]+)/;

export function githubUrlToObject(repoUrl, opts) {
  var obj = {};
  opts = opts || {};

  if (!repoUrl) return null;

  // Allow an object with nested `url` string
  // (common practice in package.json files)
  if (repoUrl.url) repoUrl = repoUrl.url;

  if (typeof repoUrl !== "string") return null;

  var shorthand = repoUrl.match(/^([\w-_]+)\/([\w-_\.]+)(?:#([\w-_\.]+))?$/);
  var mediumhand = repoUrl.match(
    /^github:([\w-_]+)\/([\w-_\.]+)(?:#([\w-_\.]+))?$/
  );
  var antiquated = repoUrl.match(/^git@[\w-_\.]+:([\w-_]+)\/([\w-_\.]+)$/);

  if (shorthand) {
    obj.user = shorthand[1];
    obj.repo = shorthand[2];
    obj.branch = shorthand[3] || "master";
    obj.host = "github.com";
  } else if (mediumhand) {
    obj.user = mediumhand[1];
    obj.repo = mediumhand[2];
    obj.branch = mediumhand[3] || "master";
    obj.host = "github.com";
  } else if (antiquated) {
    obj.user = antiquated[1];
    obj.repo = antiquated[2].replace(/\.git$/i, "");
    obj.branch = "master";
    obj.host = "github.com";
  } else {
    // Turn git+http URLs into http URLs
    repoUrl = repoUrl.replace(/^git\+/, "");

    if (!isUrl(repoUrl)) return null;

    const [, hostname, pathname] = repoUrl.match(laxUrlRegex) || [];
    if (!hostname) return null;
    if (
      hostname !== "github.com" &&
      hostname !== "www.github.com" &&
      !opts.enterprise
    )
      return null;

    var parts = pathname.match(
      /^\/([\w-_]+)\/([\w-_\.]+)(\/tree\/[\w-_\.\/]+)?(\/blob\/[\s\w-_\.\/]+)?/
    );
    // ([\w-_\.]+)
    if (!parts) return null;
    obj.user = parts[1];
    obj.repo = parts[2].replace(/\.git$/i, "");

    obj.host = hostname || "github.com";

    if (parts[3] && /^\/tree\/master\//.test(parts[3])) {
      obj.branch = "master";
      obj.path = parts[3].replace(/\/$/, "");
    } else if (parts[3]) {
      obj.branch = parts[3]
        .replace(/^\/tree\//, "")
        .match(/[\w-_.]+\/{0,1}[\w-_]+/)[0];
    } else if (parts[4]) {
      obj.branch = parts[4]
        .replace(/^\/blob\//, "")
        .match(/[\w-_.]+\/{0,1}[\w-_]+/)[0];
    } else {
      obj.branch = "master";
    }
  }

  if (obj.host === "github.com") {
    obj.apiHost = "api.github.com";
  } else {
    obj.apiHost = `${obj.host}/api/v3`;
  }

  obj.tarball_url = `https://${obj.apiHost}/repos/${obj.user}/${obj.repo}/tarball/${obj.branch}`;
  obj.clone_url = `https://${obj.host}/${obj.user}/${obj.repo}`;

  if (obj.branch === "master") {
    obj.https_url = `https://${obj.host}/${obj.user}/${obj.repo}`;
    obj.travis_url = `https://travis-ci.org/${obj.user}/${obj.repo}`;
    obj.zip_url = `https://${obj.host}/${obj.user}/${obj.repo}/archive/master.zip`;
  } else {
    obj.https_url = `https://${obj.host}/${obj.user}/${obj.repo}/blob/${obj.branch}`;
    obj.travis_url = `https://travis-ci.org/${obj.user}/${obj.repo}?branch=${obj.branch}`;
    obj.zip_url = `https://${obj.host}/${obj.user}/${obj.repo}/archive/${obj.branch}.zip`;
  }

  // Support deep paths (like lerna-style repos)
  if (obj.path) {
    obj.https_url += obj.path;
  }

  obj.api_url = `https://${obj.apiHost}/repos/${obj.user}/${obj.repo}`;

  return obj;
}

// from: https://github.com/Elixirdoc/github-url-raw
export async function githubUrlRaw(url, extFilter) {
  if (url.includes("gist.github.com")) {
    const gistId = url.split("/").slice(-1)[0];
    const blob = await fetch("https://api.github.com/gists/" + gistId).then(r =>
      r.blob()
    );
    const data = JSON.parse(await new Response(blob).text());
    // TODO: handle multiple files, e.g.: display them all
    if (extFilter) {
      const selected_file = Object.values(data.files).filter(file => {
        return file.filename.endsWith(extFilter);
      })[0];
      return selected_file && selected_file.raw_url;
    } else return data.files[Object.values(data.files)[0]].raw_url;
  }
  if (!url.includes("blob") || !url.includes("github")) {
    return null;
  }
  var ghObj = githubUrlToObject(url);
  var githubUser = ghObj.user;
  var githubRepo = ghObj.repo;
  // var githubBranch = ghObj.branch;
  var re = new RegExp(
    "^https://github.com/" + githubUser + "/" + githubRepo + "/blob/",
    "g"
  );
  var regStr = url.replace(re, "");

  return (
    "https://raw.githubusercontent.com/" +
    githubUser +
    "/" +
    githubRepo +
    "/" +
    regStr
  );
}

export async function convertZenodoFileUrl(url) {
  const myRegexp = /https?:\/\/zenodo.org\/record\/([a-zA-Z0-9-]+)\/files\/(.*)/g;
  const match = myRegexp.exec(url);
  if (!match || match.length !== 3) {
    throw new Error("Invalid zenodo url");
  }
  const [fullUrl, depositId, fileName] = match;
  const blob = await fetch(
    `https://zenodo.org/api/records/${depositId}`
  ).then(r => r.blob());
  const data = JSON.parse(await new Response(blob).text());
  const fn = fileName.split("?")[0];
  const fileObj = data.files.filter(file => {
    return file.key === fn;
  })[0];
  return fileObj.links.self;
}
