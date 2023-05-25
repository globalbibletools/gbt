# Web

The frontend code is in the `web` package. It is running on React 18. We use `tailwindcss` for styling.

## Component Design Philosophy

- Prefer using small, simple components that can be composed together, instead of large, bulky components that contain a lot of functionality.
- Implement accessibility from the beginning.
- i18n support is at the forefront of all our designs.
  - Consider different languages, different numeric systems, different reading directions, etc.

## Implementation Notes

- Our shared components (that are used throughout the app) are in `packages/web/src/shared/components`.
- Use `tailwindcss` for styling, as much as possible.
- Forms:
  - Every input must have an accessible label.
  - Where possible, every input should be validated in the browser.
