const originSuffix = `${process.env.VERCEL_GIT_COMMIT_REF?.replace(
  '/',
  '-'
)}-global-bible-tools.vercel.app`;

export const origin =
  process.env.VERCEL_ENV === 'preview'
    ? `https://api-git-${originSuffix}`
    : process.env.API_ORIGIN;
export const originAllowlist =
  process.env.VERCEL_ENV === 'preview'
    ? [
        `https://api-git-${originSuffix}`,
        `https://interlinear-git-${originSuffix}`,
      ]
    : process.env.ORIGIN_ALLOWLIST?.split(',') ?? [];
export const redirectOrigin =
  process.env.VERCEL_ENV === 'preview'
    ? `https://interlinear-git-${originSuffix}`
    : process.env.REDIRECT_ORIGIN;

export const importServer = 'https://hebrewgreekbible.online';
export const importTriggerUrl = process.env.IMPORT_URL;
