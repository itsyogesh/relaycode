1. Core Structure
- components/params/
  - inputs/           # Base input components 
  - compound/         # Complex/composed inputs
  - utils/           # Helper functions
  - types.ts         # Type definitions
  - mapping.ts       # Component mapping logic
  - index.ts         # Main exports

2. Input Categories:
a) Simple Inputs:
- Boolean -> Toggle
- Number/Amount -> Number input with validation
- Text -> Text input
- Hash -> Special hash input with validation
- Bytes -> Bytes input with hex validation

b) Complex Inputs:
- Account -> Address input with validation
- Balance -> Amount input with token selection
- Call -> Call selector
- Enum -> Dropdown with sub-fields
- Option -> Toggle with nested input
- Vector -> Dynamic array of inputs
- Struct -> Object with multiple fields

3. Features:
- Zod validation schemas
- React Hook Form integration
- Proper error handling
- Help text and documentation
- Mobile responsive
- Dark/light theme support 