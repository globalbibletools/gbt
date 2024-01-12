const query = new URLSearchParams(window.location.search);
const queryFeatures = query.get('_f')?.split(',') ?? [];

const flags = {
  comments:
    process.env['NX_FEAT_COMMENTS'] === 'true' ||
    queryFeatures.includes('comments'),
};

export function isFlagEnabled(flag: keyof typeof flags): boolean {
  return !!flags[flag];
}
