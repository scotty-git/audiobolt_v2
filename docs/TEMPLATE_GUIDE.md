# Template Guide

This guide explains how to create onboarding flows and questionnaires using our JSON template format with real-time saving capabilities.

## Template Structure

Both onboarding flows and questionnaires follow a similar sectioned structure and are stored in Supabase:

```json
{
  "id": "uuid",                         // Unique UUID
  "title": "Template Title",            // Display title
  "description": "Template Description", // Brief description
  "version": "1.0.0",                   // Semantic version
  "type": "questionnaire",              // "questionnaire" or "onboarding"
  "sections": [],                       // Array of sections
  "settings": {},                       // Template settings
  "metadata": {},                       // Additional metadata
  "user_id": "uuid",                    // Owner's UUID
  "created_at": "timestamp",            // Creation timestamp
  "updated_at": "timestamp"             // Last update timestamp
}
```

### Sections

Each template is divided into sections:

```json
{
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "description": "Section Description",
      "order": 0,
      "isOptional": false,
      "questions": []
    }
  ]
}
```

### Questions

Each section contains questions:

```json
{
  "questions": [
    {
      "id": "question-1",
      "type": "text",
      "text": "Question text",
      "description": "Optional description",
      "placeholder": "Optional placeholder",
      "validation": {
        "required": true,
        "minLength": 2,
        "maxLength": 100
      }
    }
  ]
}
```

## Question Types

### Text Input
```json
{
  "id": "text-question",
  "type": "text",
  "text": "What is your name?",
  "placeholder": "Enter your full name",
  "validation": {
    "required": true,
    "minLength": 2,
    "maxLength": 100
  }
}
```

### Email Input
```json
{
  "id": "email-question",
  "type": "email",
  "text": "What's your email address?",
  "validation": {
    "required": true,
    "pattern": "email"
  }
}
```

### Multiple Choice
```json
{
  "id": "choice-question",
  "type": "multiple_choice",
  "text": "Select your preference",
  "options": [
    { "id": "opt1", "text": "Option 1", "value": "option1" },
    { "id": "opt2", "text": "Option 2", "value": "option2" }
  ],
  "validation": {
    "required": true
  }
}
```

### Slider
```json
{
  "id": "slider-question",
  "type": "slider",
  "text": "Rate from 1-10",
  "validation": {
    "required": true,
    "minValue": 1,
    "maxValue": 10,
    "step": 1
  }
}
```

### Checkbox Group
```json
{
  "id": "checkbox-question",
  "type": "checkbox",
  "text": "Select all that apply",
  "options": [
    { "id": "opt1", "text": "Option 1", "value": "option1" },
    { "id": "opt2", "text": "Option 2", "value": "option2" }
  ],
  "validation": {
    "required": true,
    "minSelected": 1
  }
}
```

## Validation Rules

Available validation options:
- `required`: Boolean
- `minLength`: Number (for text)
- `maxLength`: Number (for text)
- `minValue`: Number (for slider)
- `maxValue`: Number (for slider)
- `step`: Number (for slider)
- `pattern`: String (for email)
- `minSelected`: Number (for checkbox)

## Settings

Template-wide settings:

```json
{
  "settings": {
    "allowSkipSections": false,
    "showProgressBar": true,
    "shuffleSections": false,
    "completionMessage": "Thank you for completing the questionnaire!"
  }
}
```

## Metadata

Additional template information:

```json
{
  "metadata": {
    "createdAt": "2024-03-14T12:00:00Z",
    "updatedAt": "2024-03-14T12:00:00Z",
    "createdBy": "admin",
    "tags": ["self-help", "personal-development"],
    "category": "mindfulness",
    "status": "published"
  }
}
```

## Adding Templates

### Using the Builder Interface

1. Navigate to Templates
2. Click "Create New Onboarding Flow" or "Create New Questionnaire"
3. Use the visual builder to create sections and questions
4. Changes are automatically saved in real-time
5. Template status is shown in the top-right corner

### Using JSON Import

1. Navigate to Templates
2. Click "Create New"
3. Click "Import from JSON"
4. Paste your JSON template
5. Click "Import"
6. Template will be validated and saved to Supabase

## Real-time Collaboration

Templates support real-time updates:

1. **Auto-saving**
   - All changes are saved automatically
   - Progress is synced across devices
   - Network status is shown in the UI

2. **Version Control**
   - Each save creates a new version
   - Version history is maintained
   - Ability to revert changes

3. **Permissions**
   - Templates can be private or shared
   - Row Level Security controls access
   - Published templates are read-only

## Example Templates

See the following files for complete examples:
- `/data/templates/defaultOnboardingFlow.ts`
- `/data/templates/defaultQuestionnaires.ts`

## Best Practices

1. **Template Management**
   - Use descriptive titles
   - Add proper metadata
   - Set appropriate permissions
   - Test before publishing

2. **Real-time Features**
   - Handle offline scenarios
   - Implement conflict resolution
   - Show sync status
   - Cache responses

3. **Security**
   - Validate user permissions
   - Sanitize user input
   - Follow RLS policies
   - Handle errors gracefully