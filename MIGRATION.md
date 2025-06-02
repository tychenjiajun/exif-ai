# Migration Guide: Upgrading to the New Exif AI API

This guide helps you migrate from the old exif-ai API to the new, improved API design.

## Overview

The new API provides three usage patterns while maintaining full backward compatibility:

1. **Simple API** - `processImage()` for common use cases
2. **Fluent Builder API** - `new ExifAI()` for readable, chainable code  
3. **Advanced API** - `processImageAdvanced()` for complex configurations
4. **Legacy API** - `execute()` still works (no changes needed)

## CLI Migration

### Old CLI Syntax (Still Works)
```bash
# Old way - still supported
exif-ai -i photo.jpg -a ollama -T description -v -d
exif-ai -i photo.jpg -a openai -m gpt-4o -p "Custom prompt"
```

### New CLI Syntax (Recommended)
```bash
# New way - cleaner and more intuitive
exif-ai photo.jpg --provider ollama --tasks description --verbose --dry-run
exif-ai photo.jpg --provider openai --model gpt-4o --description-prompt "Custom prompt"
```

### CLI Changes Summary
- **Positional argument**: Image path is now a positional argument
- **Better option names**: `--provider` instead of `-a/--api-provider`
- **Clearer flags**: `--dry-run` instead of `-d`, `--verbose` instead of `-v`
- **Grouped help**: Options are organized in logical groups
- **Examples in help**: Built-in examples with `--help`

## Library Migration

### 1. Simple Use Cases

**Before (Old API):**
```typescript
import { execute } from "exif-ai";

await execute({
  path: "photo.jpg",
  provider: "ollama",
  tasks: ["description"],
  dry: true,
  verbose: true
});
```

**After (New Simple API):**
```typescript
import { processImage } from "exif-ai";

await processImage({
  image: "photo.jpg",
  provider: "ollama",
  tasks: ["description"],
  preview: true,
  verbose: true
});
```

### 2. Complex Configurations

**Before (Old API):**
```typescript
import { execute } from "exif-ai";

await execute({
  path: "photo.jpg",
  provider: "openai",
  model: "gpt-4o",
  tasks: ["description", "tag"],
  descriptionPrompt: "Describe this image",
  tagPrompt: "Generate tags",
  descriptionTags: ["XPComment", "Description"],
  tagTags: ["Subject", "Keywords"],
  verbose: true,
  dry: false,
  avoidOverwrite: true,
  repeat: 2
});
```

**After (New Fluent API):**
```typescript
import { ExifAI } from "exif-ai";

await new ExifAI("photo.jpg")
  .provider("openai")
  .model("gpt-4o")
  .tasks("description", "tag")
  .descriptionPrompt("Describe this image")
  .tagPrompt("Generate tags")
  .descriptionTags("XPComment", "Description")
  .tagTags("Subject", "Keywords")
  .verbose()
  .skipExisting()
  .retries(2)
  .run();
```

**Or (New Advanced API):**
```typescript
import { processImageAdvanced } from "exif-ai";

await processImageAdvanced({
  image: "photo.jpg",
  ai: {
    provider: "openai",
    model: "gpt-4o",
    descriptionPrompt: "Describe this image",
    tagPrompt: "Generate tags"
  },
  exif: {
    descriptionTags: ["XPComment", "Description"],
    tagTags: ["Subject", "Keywords"]
  },
  options: {
    tasks: ["description", "tag"],
    verbose: true,
    skipExisting: true,
    retries: 2
  }
});
```

## Parameter Name Changes

| Old Parameter | New Parameter | Notes |
|---------------|---------------|-------|
| `path` | `image` | More descriptive |
| `dry` | `preview` | Clearer intent |
| `avoidOverwrite` | `skipExisting` | More intuitive |
| `repeat` | `retries` | Standard terminology |
| `writeArgs` | `exifArgs` | Shorter name |

## Migration Strategy

### Option 1: No Changes (Recommended for existing code)
Your existing code will continue to work without any changes. The old `execute()` function and CLI syntax are fully supported.

### Option 2: Gradual Migration
Migrate new code to use the new API while keeping existing code unchanged:

```typescript
// Existing code - keep as is
import { execute } from "exif-ai";

// New code - use new API
import { processImage, ExifAI } from "exif-ai";
```

### Option 3: Full Migration
Update all code to use the new API for consistency:

1. Replace `execute()` calls with appropriate new API
2. Update parameter names where needed
3. Consider using the fluent API for better readability

## Benefits of Migration

### CLI Benefits
- **Clearer syntax**: More intuitive command structure
- **Better help**: Organized options with examples
- **Shorter commands**: Less typing for common operations

### Library Benefits
- **Better TypeScript support**: Improved type definitions
- **Multiple API styles**: Choose what fits your use case
- **Fluent interface**: More readable code
- **Better error messages**: Clearer error reporting

## Examples

### Quick Start Examples

```typescript
// Simple: Just process an image
await processImage({
  image: "photo.jpg",
  provider: "ollama"
});

// Fluent: Chain operations
await new ExifAI("photo.jpg")
  .provider("openai")
  .model("gpt-4o")
  .preview()
  .run();

// Advanced: Full control
await processImageAdvanced({
  image: "photo.jpg",
  ai: { provider: "google", model: "gemini-1.5-pro" },
  options: { tasks: ["description"], preview: true }
});
```

## Need Help?

- Check the updated README.md for comprehensive examples
- Run `exif-ai --help` to see the new CLI options
- Look at `examples/new-api-examples.js` for working code samples
- The old API documentation is still valid for the `execute()` function

## Backward Compatibility Promise

We maintain full backward compatibility:
- All existing CLI commands work unchanged
- The `execute()` function works exactly as before
- No breaking changes to existing functionality
- Old parameter names are still supported

You can migrate at your own pace or not at all - your choice!
