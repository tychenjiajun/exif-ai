# Vercel AI SDK Integration Improvements

This document outlines the improvements made to integrate the Vercel AI SDK into the exif-ai project, providing enhanced AI functionality with better provider support and modern patterns.

## Overview

The project has been upgraded to use the **Vercel AI SDK** (v4.3.16+) for all AI functionality, replacing the previous custom implementations with a unified, modern approach that supports multiple AI providers through standardized interfaces.

## Key Improvements

### 1. **Unified AI SDK Implementation**
- **Before**: Custom implementations for each provider with inconsistent interfaces
- **After**: Single unified implementation using Vercel AI SDK patterns
- **Benefits**: Consistent behavior, better error handling, standardized multimodal support

### 2. **Enhanced Provider Support**
The following AI providers are now supported through their official AI SDK packages:

| Provider | Package | Models Supported | Environment Variable |
|----------|---------|------------------|---------------------|
| OpenAI | `@ai-sdk/openai` | GPT-4o, GPT-4 Turbo, etc. | `OPENAI_API_KEY` |
| Google | `@ai-sdk/google` | Gemini 1.5 Pro, Gemini 1.5 Flash | `GOOGLE_API_KEY` |
| Anthropic | `@ai-sdk/anthropic` | Claude 3.5 Sonnet, Claude 3 Opus | `ANTHROPIC_API_KEY` |
| Mistral | `@ai-sdk/mistral` | Mistral Large, Mistral Medium | `MISTRAL_API_KEY` |
| Ollama | `@ai-sdk/openai` (compatible) | Llama 3.2 Vision, etc. | `OLLAMA_BASE_URL` |
| Amazon Bedrock | `@ai-sdk/amazon-bedrock` | Claude 3 Sonnet, etc. | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure OpenAI | `@ai-sdk/azure` | GPT-4 Vision, etc. | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` |
| DeepInfra | `@ai-sdk/deepinfra` | CogVLM2, etc. | `DEEPINFRA_API_KEY` |
| Fireworks | `@ai-sdk/fireworks` | Llama 3, etc. | `FIREWORKS_API_KEY` |
| OpenAI Compatible | `@ai-sdk/openai-compatible` | Various models | `OPENAI_COMPATIBLE_API_KEY`, `OPENAI_COMPATIBLE_BASE_URL` |
| TogetherAI | `@ai-sdk/togetherai` | CogVLM2, etc. | `TOGETHER_API_KEY` |
| XAI | `@ai-sdk/xai` | Grok 1.5 Vision | `XAI_API_KEY` |
| OpenRouter | `@openrouter/ai-sdk-provider` | Various models | `OPENROUTER_API_KEY` |

### 3. **Improved Multimodal Support**
- **Native Buffer Support**: AI SDK can handle image buffers directly without base64 conversion
- **Automatic Image Processing**: Smart image resizing based on provider limits
- **Consistent Message Format**: Unified message structure across all providers

### 4. **Better Error Handling**
- **Provider-Specific Errors**: Clear error messages for each provider
- **Graceful Fallbacks**: Better handling of API failures
- **Validation**: Input validation for models and providers

## Technical Implementation

### Core Files Modified

1. **`src/provider/ai-sdk.ts`** - Main AI SDK implementation
   - Unified provider configuration
   - Standardized image processing
   - Modern AI SDK patterns

2. **Package Dependencies** - Added official AI SDK packages
   ```json
   {
     "@ai-sdk/amazon-bedrock": "^2.2.x",
     "@ai-sdk/anthropic": "^1.2.x",
     "@ai-sdk/azure": "^1.3.x",
     "@ai-sdk/deepinfra": "^0.2.x",
     "@ai-sdk/fireworks": "^0.2.x",
     "@ai-sdk/google": "^1.2.x", 
     "@ai-sdk/mistral": "^1.2.x",
     "@ai-sdk/openai": "^1.3.x",
     "@ai-sdk/openai-compatible": "^0.2.x",
     "@ai-sdk/togetherai": "^0.2.x",
     "@ai-sdk/xai": "^1.2.x",
     "@openrouter/ai-sdk-provider": "^0.7.x"
   }
   ```

### Key Functions

#### `getDescription(options)`
Generates image descriptions using the AI SDK's `generateText` function.

```typescript
const description = await getDescription({
  buffer: imageBuffer,
  model: "gpt-4o",
  prompt: "Describe this image in detail.",
  provider: "openai"
});
```

#### `getTags(options)`
Generates image tags using the same unified interface.

```typescript
const tags = await getTags({
  buffer: imageBuffer,
  model: "gemini-1.5-pro", 
  prompt: "Generate tags for this image.",
  provider: "google"
});
```

## Usage Examples

### Command Line Usage
```bash
# Using OpenAI GPT-4o
OPENAI_API_KEY=your_key exif-ai -i image.jpg -a openai -m gpt-4o

# Using Google Gemini
GOOGLE_API_KEY=your_key exif-ai -i image.jpg -a google -m gemini-1.5-pro

# Using Anthropic Claude
ANTHROPIC_API_KEY=your_key exif-ai -i image.jpg -a anthropic -m claude-3-5-sonnet-20241022

# Using local Ollama
exif-ai -i image.jpg -a ollama -m llama3.2-vision

# Using Amazon Bedrock
AWS_ACCESS_KEY_ID=your_key AWS_SECRET_ACCESS_KEY=your_secret exif-ai -i image.jpg -a amazon -m anthropic.claude-3-sonnet-20240229-v1:0

# Using Azure OpenAI
AZURE_OPENAI_API_KEY=your_key AZURE_OPENAI_ENDPOINT=your_endpoint exif-ai -i image.jpg -a azure -m gpt-4-vision

# Using DeepInfra
DEEPINFRA_API_KEY=your_key exif-ai -i image.jpg -a deepinfra -m cogvlm2-llama3-8b-chat

# Using Fireworks
FIREWORKS_API_KEY=your_key exif-ai -i image.jpg -a fireworks -m accounts/fireworks/models/llama-v3-8b-instruct

# Using OpenAI Compatible
OPENAI_COMPATIBLE_API_KEY=your_key OPENAI_COMPATIBLE_BASE_URL=your_url exif-ai -i image.jpg -a openai-compatible -m gpt-4-vision

# Using TogetherAI
TOGETHER_API_KEY=your_key exif-ai -i image.jpg -a together -m cogvlm2-llama3-8b-chat

# Using XAI
XAI_API_KEY=your_key exif-ai -i image.jpg -a xai -m grok-1.5-vision

# Using OpenRouter
OPENROUTER_API_KEY=your_key exif-ai -i image.jpg -a openrouter -m openai/gpt-4o
```

### Programmatic Usage
```javascript
import { execute } from 'exif-ai';

await execute({
  path: 'image.jpg',
  provider: 'openai',
  model: 'gpt-4o',
  tasks: ['description', 'tags'],
  verbose: true
});
```

## Migration Guide

### For Users
- **No Breaking Changes**: All existing command-line usage continues to work
- **New Models**: Access to latest models from all providers
- **Better Performance**: Improved image processing and API efficiency

### For Developers
- **Updated Imports**: AI SDK packages are now used internally
- **Consistent Interface**: All providers use the same function signatures
- **Better TypeScript**: Improved type safety and IntelliSense

## Testing

The implementation includes comprehensive test coverage:

- **Unit Tests**: Provider-specific functionality
- **Integration Tests**: End-to-end image processing
- **Mock Providers**: Test providers for CI/CD environments

Run tests with:
```bash
pnpm test
```

## Performance Improvements

1. **Reduced Memory Usage**: Direct buffer handling without base64 conversion
2. **Faster Processing**: Optimized image resizing pipeline
3. **Better Caching**: AI SDK's built-in request optimization
4. **Parallel Processing**: Concurrent description and tag generation

## Future Enhancements

The AI SDK integration provides a foundation for future improvements:

- **Streaming Support**: Real-time response streaming
- **Tool Calling**: Function calling capabilities
- **Embeddings**: Semantic search and similarity
- **Image Generation**: AI-powered image creation
- **Additional Providers**: Easy integration of new AI services

## Troubleshooting

### Common Issues

1. **API Key Errors**
   ```
   Error: Missing API key for provider 'openai'
   ```
   **Solution**: Set the appropriate environment variable (e.g., `OPENAI_API_KEY`)

2. **Model Not Found**
   ```
   Error: Model 'gpt-5' not found
   ```
   **Solution**: Use a valid model name for the provider

3. **Provider Not Supported**
   ```
   Error: Unsupported provider: 'custom'
   ```
   **Solution**: Use one of the supported providers: openai, google, anthropic, mistral, ollama, amazon, bedrock, azure, deepinfra, fireworks, openai-compatible, together, togetherai, xai, openrouter

### Debug Mode
Enable verbose logging to see detailed AI SDK operations:
```bash
exif-ai -i image.jpg -a openai --verbose
```

## Contributing

When contributing to the AI functionality:

1. **Follow AI SDK Patterns**: Use official AI SDK patterns and conventions
2. **Test All Providers**: Ensure changes work across all supported providers
3. **Update Documentation**: Keep this document and examples up to date
4. **Performance Testing**: Verify that changes don't impact performance

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK Providers](https://sdk.vercel.ai/providers)
- [Multimodal Guide](https://sdk.vercel.ai/docs/foundations/prompts#multimodal-messages)
- [Provider Comparison](https://sdk.vercel.ai/providers/ai-sdk-providers)
