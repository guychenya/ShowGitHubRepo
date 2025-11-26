# Changelog

All notable changes to GitOptic will be documented in this file.

## [Unreleased] - 2025-11-25

### Added - Chat Enhancements

#### Copy Message Functionality
- Added hover-to-reveal copy button on all chat messages (user and assistant)
- Visual feedback with green checkmark icon for 2 seconds after copying
- Button positioned at top-right corner of message bubbles
- Smooth opacity transitions on hover

#### Rich Markdown Support
- **Headings**: H1 (1.5em), H2 (1.25em), H3 (1.1em) with underline borders
- **Text formatting**: Bold (white), italic (golden), links (pink with hover)
- **Code blocks**: Dark slate background with syntax-ready styling
- **Inline code**: Golden text on dark background with monospace font
- **Tables**: Full support with borders, headers, and hover effects
- **Lists**: Proper bullet/numbered formatting with spacing
- **Blockquotes**: Pink left border with subtle background
- **Images**: Auto-sizing, rounded corners, lazy loading
- **Line breaks**: Added `remark-breaks` plugin for proper formatting

#### Typography Improvements
- Better word wrapping for long text
- Enhanced line heights (1.7 for body, 1.6 for lists)
- Consistent spacing throughout chat messages
- Responsive design considerations

### Added - README Display Fix

#### HTML Support
- Added `rehype-raw` plugin to ReactMarkdown in README modal
- GitHub README HTML tags now render correctly (img, h1, p, etc.)
- Badges, logos, and centered images display properly
- Maintains security while allowing safe HTML rendering

### Technical Changes

#### Dependencies Added
- `remark-breaks@^4.0.0` - Line break handling in markdown
- `rehype-raw@^7.0.0` - HTML support in markdown

#### Files Modified
- `components/Chat.tsx`:
  - Added `copiedIndex` state for copy feedback
  - Added `handleCopy` function
  - Enhanced ReactMarkdown with custom components for all elements
  - Expanded CSS styles for rich markdown rendering
  - Added `remarkBreaks` plugin
  
- `App.tsx`:
  - Added `rehype-raw` import
  - Added `rehypePlugins={[rehypeRaw]}` to README ReactMarkdown

- `README.md`:
  - Updated Tech Stack section with new markdown plugins
  - Updated Features section with chat and copy functionality

- `package.json`:
  - Added `rehype-raw` and `remark-breaks` to dependencies

#### New Files
- `CHAT_ENHANCEMENTS.md` - Detailed documentation of chat features
- `CHANGELOG.md` - This file

### Build Status
- ✅ Build successful (833.40 kB bundle)
- ✅ All TypeScript compilation passed
- ✅ No breaking changes

---

## Previous Updates

See [CHANGES.md](./CHANGES.md) for multi-LLM support and BYOK feature history.
