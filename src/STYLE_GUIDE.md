# Style Guide for DonateSpace

## Using Global Styles

To ensure consistency across our application, we use a combination of global styles and component-specific styles. Follow these steps when creating or updating components:

1. Import the necessary utilities:
   ```javascript
   import { applyGlobalStyles, globalClasses } from '../utils/styleUtils';
   ```

2. Combine your component-specific styles with global styles:
   ```javascript
   const combinedStyles = applyGlobalStyles(styles, globalClasses);
   ```

3. Use the `combinedStyles` object to apply styles in your component:
   ```jsx
   <div className={combinedStyles.container}>
     <h1 className={combinedStyles.header}>Your Component Title</h1>
     <p className={combinedStyles.paragraph}>Your content here</p>
   </div>
   ```

## Global Classes

The following global classes are available:

- `container`: For main container elements
- `card`: For card-like elements
- `header`: For main headings (h1)
- `subheader`: For subheadings (h2, h3)
- `paragraph`: For paragraph text
- `button`: For basic buttons
- `primaryButton`: For primary action buttons
- `secondaryButton`: For secondary action buttons
- `input`: For form inputs
- `label`: For form labels
- `error`: For error messages

## Color Palette

- Primary Color: #4CAF50 (Green)
- Secondary Color: #2196F3 (Blue)
- Accent Color: #FFC107 (Amber)
- Neutral Colors:
  - Dark Gray: #333333
  - Light Gray: #F5F5F5
  - White: #FFFFFF

## Typography

- Primary Font: 'Roboto' (sans-serif)
- Secondary Font: 'Lato' (sans-serif)
- Font Sizes:
  - H1: 36px
  - H2: 30px
  - H3: 24px
  - Body: 16px
  - Small text: 14px

## Best Practices

1. Always use the `combinedStyles` approach to ensure consistency with global styles.
2. Use semantic HTML elements (`<header>`, `<main>`, `<footer>`, etc.) where appropriate.
3. Ensure your component is responsive and looks good on all screen sizes.
4. Use the provided color palette for all color choices in your component.
5. Stick to the defined typography rules for font sizes and families.
6. When in doubt, refer to existing components for examples of how to structure and style your new component.

By following this guide, we can maintain a consistent look and feel across our entire application while still allowing for component-specific customization when necessary.