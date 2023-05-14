export default function getApiUrl() {
  if (process.env.NX_API_URL) {
    return process.env.NX_API_URL;
  } else if (process.env.VERCEL && process.env.VERCEL_ENV === 'preview') {
    return `https://gloss-translation-api-git-${process.env.VERCEL_GIT_COMMIT_REF}-${process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN}.vercel.app`;
  } else {
    throw new Error('missing env var API_URL');
  }
}
