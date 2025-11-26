# Changes Log

## Latest Updates (Nov 25, 2025)

### Chat Enhancements
- **Copy functionality**: Hover-to-reveal copy button on all messages with visual feedback
- **Rich markdown support**: Enhanced rendering for headings, lists, tables, code blocks, images, blockquotes
- **Line breaks**: Added `remark-breaks` plugin for proper formatting
- **Better typography**: Improved word wrapping, line heights, and spacing

### README Display Fix
- **HTML support**: Added `rehype-raw` plugin to render HTML tags in README files
- **Image display**: GitHub README images now display correctly (e.g., badges, logos, centered images)

## Previous Updates

### Multi-LLM Support

#### Summary
Added support for multiple LLM providers (Gemini, Groq, and OpenAI) with automatic fallback.

## New Files Created

### `llm-service.ts`
- Abstraction layer for multiple LLM providers
- Automatic provider selection based on available API keys
- Priority order: Gemini → Groq → OpenAI
- Unified interface for all providers

## Modified Files

### `.env.local`
- Added `GROQ_API_KEY` field
- Added `OPENAI_API_KEY` field
- Updated comments with links to get API keys

### `.env.local.example`
- Added all three API key options with instructions
- Clear documentation on where to get each key

### `vite.config.ts`
- Added environment variable definitions for all three API keys
- Removed legacy `API_KEY` reference

### `App.tsx`
- Replaced direct Gemini API calls with `llm-service` abstraction
- Updated error messages to be provider-agnostic
- Added provider detection on app load
- Cleaner code with centralized LLM logic

### `README.md`
- Added "Supported LLM Providers" section
- Updated setup instructions
- Added links to get API keys for all providers
- Clarified priority order

### `package.json`
- Added `@types/react-dom` to devDependencies

## Features

### Supported Providers

1. **Google Gemini** (Free tier)
   - Model: `gemini-2.5-flash`
   - Supports structured JSON output with schema validation

2. **Groq** (Free tier)
   - Model: `llama-3.3-70b-versatile`
   - Fast inference with JSON mode

3. **OpenAI** (Paid)
   - Model: `gpt-4o-mini`
   - JSON mode with structured output

### Automatic Fallback
- App checks for API keys in priority order
- Uses first available provider
- Clear error messages if no keys are configured

## Testing

To test different providers:

1. **Test with Gemini only:**
   ```bash
   # In .env.local, keep only GEMINI_API_KEY
   npm run dev
   ```

2. **Test with Groq:**
   ```bash
   # Remove GEMINI_API_KEY, add GROQ_API_KEY
   npm run dev
   ```

3. **Test with OpenAI:**
   ```bash
   # Remove other keys, add OPENAI_API_KEY
   npm run dev
   ```

## Benefits

- **Flexibility**: Users can choose their preferred provider
- **Cost optimization**: Free tiers available (Gemini, Groq)
- **Reliability**: Fallback options if one provider has issues
- **Clean architecture**: Centralized LLM logic
- **Easy to extend**: Add new providers by updating `llm-service.ts`
