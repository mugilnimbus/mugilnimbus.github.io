// The opening of each episode: a question the visitor has felt, then the single idea that answers it.
// Wording is drawn from the reviewed project descriptions; nothing here adds a result or a capability.
const hook = (question, see, act, notes, scene) => ({ question, see, act, notes, scene });

export const groups = Object.freeze([
  { name: 'Agents', ids: ['thursday'] },
  { name: 'Knowledge and products', ids: ['agentic-rag', 'finance', 'invoice', 'llm-gui'] },
  { name: 'Model internals', ids: ['llm-view', 'tensor-tree', 'quantization', 'tokenization', 'automl'] },
  { name: 'Data and vision', ids: ['pollution', 'image-privacy', 'irrigation', 'gpu-hud'] },
]);
// Episode order follows the groups, so the series and the episode list read the same way.
export const order = Object.freeze(groups.flatMap(group => group.ids));
export const featured = Object.freeze(['thursday', 'agentic-rag', 'finance', 'llm-view']);

export const hooks = Object.freeze({
  'thursday': hook('Tired of clicking through the same screens, hour after hour?',
    'Thursday reads every line on the screen and finds every button, with its exact position.', 'An LLM picks the next step, a tool clicks the exact spot, then Thursday looks again.',
    ['reads the text, finds every button', 'clicks the exact spot, looks again'], 'screen'),
  'agentic-rag': hook('Ever got an answer from AI and wondered where it came from?',
    'Each document is kept whole, then broken into pieces that can be found.', 'Every answer keeps a path back to its source.',
    ['documents become findable pieces', 'the answer points back to its source'], 'docs'),
  'finance': hook('Would you let an AI write to your bank balance?',
    'In Nimbus Finance the ledger does the maths, not the AI.', 'The AI can read your numbers. It can never change them.',
    ['AI reads', 'AI never writes'], 'ledger'),
  'invoice': hook('Still typing invoices into a spreadsheet by hand?',
    'Each invoice is read and checked before anything is written.', 'Anything uncertain goes to a person, not into the stock sheet.',
    ['read, then checked', 'unsure? a human decides'], 'sheet'),
  'llm-gui': hook('Ever downloaded a huge model, only to find it will not run on your machine?',
    'LLM GUI checks your GPU, memory and model format first.', 'Only then does it download and launch.',
    ['check first', 'then load'], 'check'),
  'llm-view': hook('Ever wondered what is actually inside a language model?',
    'LLM View 3D opens a model into its layers.', 'You can follow a tensor through each operation.',
    ['open the model', 'follow the tensors'], 'layers'),
  'tensor-tree': hook('Do AI architecture diagrams leave you guessing what really happens?',
    'Tensor Tree breaks an architecture into single operations.', 'Each one is shown tensor by tensor, with its formula and paper.',
    ['one operation at a time', 'tensor by tensor'], 'steps'),
  'quantization': hook('Ever run out of memory just trying to shrink a model?',
    'Many workflows copy the full model before shrinking it.', 'This one quantizes in place, so a second full copy is never needed.',
    ['no second copy', 'shrink it where it sits'], 'weights'),
  'tokenization': hook('Does “bank” mean money or a river? You know. Does the model?',
    'The same word can carry different meanings.', 'This prototype uses context to tell those meanings apart.',
    ['same word', 'different meanings'], 'tokens'),
  'automl': hook('How many layers does a neural network need, and why do most people just guess?',
    'This framework tests many network shapes on known data patterns.', 'The shape of the data guides the choice of architecture.',
    ['try many shapes', 'let the data guide it'], 'search'),
  'pollution': hook('Do you know how clean the air is on your own street?',
    'Dublin is split into small grid squares, each with its own forecast.', 'When the data drifts, the model is retrained automatically.',
    ['a street-level grid', 'retrains when the data shifts'], 'grid'),
  'image-privacy': hook('Ever shared a photo and later noticed what was in the background?',
    'The image is split into regions, and each one is checked.', 'Sensitive text, symbols and objects are masked before sharing.',
    ['find what is sensitive', 'mask it'], 'mask'),
  'irrigation': hook('What if a field could tell when it needs water?',
    'A camera and a moisture sensor watch the crop.', 'A small neural network decides, and the motor responds.',
    ['it looks and measures', 'then it waters'], 'plant'),
  'gpu-hud': hook('Ever lost track of what your GPUs are doing mid-run?',
    'A small always-there panel shows each GPU and the CPU.', 'If a sensor goes missing, it keeps working.',
    ['every GPU at a glance', 'a missing sensor will not break it'], 'hud'),
});

// Walkthrough steps for projects whose catalogue steps do not suit the ring view; none at present.
export const detailSteps = Object.freeze({});
