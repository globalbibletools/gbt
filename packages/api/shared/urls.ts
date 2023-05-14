export function getWebUrl() {
  if (process.env.WEB_URL) {
    return process.env.WEB_URL;
  } else if (process.env.VERCEL && process.env.VERCEL_ENV === 'preview') {
    return `https://gloss-translation-git-${process.env.VERCEL_GIT_COMMIT_REF}-${process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN}.vercel.app`;
  } else {
    throw new Error('missing env var WEB_URL');
  }
}

export function getApiUrl() {
  if (process.env.API_URL) {
    return process.env.API_URL;
  } else if (process.env.VERCEL && process.env.VERCEL_ENV === 'preview') {
    return `https://gloss-translation-api-git-${process.env.VERCEL_GIT_COMMIT_REF}-${process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN}.vercel.app`;
  } else {
    throw new Error('missing env var WEB_URL');
  }
}
