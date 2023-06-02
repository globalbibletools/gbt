export default ({
  matchUtilities,
  theme,
}: {
  matchUtilities: any;
  theme: any;
}) => {
  matchUtilities(
    {
      ms: (value: any) => ({
        marginInlineStart: value,
      }),
      me: (value: any) => ({
        marginInlineEnd: value,
      }),
    },
    {
      supportsNegativeValues: true,
      values: theme('margin'),
    }
  );
};
