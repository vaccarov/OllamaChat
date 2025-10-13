import { PromptItem } from '@/types/Prompt';

export const systemPromptPresets: PromptItem[] = [
  {
    id: 'default',
    name: 'Default (Empty)',
    prompt: '',
  },
  {
    id: 'helpful_assistant',
    name: 'Helpful Assistant',
    prompt: 'You are a helpful assistant.',
  },
  {
    id: 'code_reviewer',
    name: 'Code Reviewer',
    prompt: 'You are a code reviewer. Provide constructive feedback on the provided code.',
  },
  {
    id: 'creative_writer',
    name: 'Creative Writer',
    prompt: 'You are a creative writer. Generate imaginative and engaging stories.',
  },
  {
    id: 'scientific_for_kids',
    name: 'Kids Science educator',
    prompt:
      "You are a scientific popularization expert, capable of explaining complex concepts clearly, precisely, and adapted for children aged 8 and over.\nYour answers must be:\nScientifically accurate, without oversimplification or false claims.\nFormulated with simple words, short sentences, and a calm, benevolent tone.\nAdapted to the understanding level of a curious child, while remaining honest about what is known or not.\nIllustrated with concrete examples, accessible comparisons, or short analogies if it helps understanding.\nIf a subject is too complicated or uncertain, you can say so frankly while offering an explanation adapted to the child's level.\nYou never make exaggerated promises, magical or unrealistic scenarios. You respect children's intelligence",
  },
];

export const imagePromptPresets: PromptItem[] = [
  {
    id: 'default',
    name: 'Default (Empty)',
    prompt: '',
  },
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    prompt: 'photorealistic, 8k, cinematic lighting, sharp focus, detailed',
  },
  {
    id: 'anime',
    name: 'Anime',
    prompt: 'anime style, vibrant colors, detailed background, by Makoto Shinkai',
  },
  {
    id: 'fantasy',
    name: 'Fantasy Art',
    prompt: 'fantasy art, epic, detailed, intricate, concept art, by Greg Rutkowski',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    prompt: 'watercolor painting, soft, blended colors, paper texture',
  },
];

export const imageNegativePromptPresets: PromptItem[] = [
  {
    id: 'default',
    name: 'Default (Empty)',
    prompt: '',
  },
  {
    id: 'universal',
    name: 'Universal',
    prompt:
      'worst quality, normal quality, low quality, low res, blurry, distortion, text, watermark, logo, banner, extra digits, cropped, jpeg artifacts, signature, username, error, sketch, duplicate, ugly, monochrome, horror, geometry, mutation, disgusting, bad anatomy, bad proportions, bad quality, deformed, disconnected limbs, out of frame, out of focus, dehydrated, disfigured, extra arms, extra limbs, extra hands, fused fingers, gross proportions, long neck, jpeg, malformed limbs, mutated, mutated hands, mutated limbs, missing arms, missing fingers, picture frame, poorly drawn hands, poorly drawn face, collage, pixel, pixelated, grainy, color aberration, amputee, autograph, bad illustration, beyond the borders, blank background, body out of frame, boring background, branding, cut off, dismembered, disproportioned, distorted, draft, duplicated features, extra fingers, extra legs, fault, flaw, grains, hazy, identifying mark, improper scale, incorrect physiology, incorrect ratio, indistinct, kitsch, low resolution, macabre, malformed, mark, misshapen, missing hands, missing legs, mistake, morbid, mutilated, off-screen, outside the picture, poorly drawn feet, printed words, render, repellent, replicate, reproduce, revolting dimensions, script, shortened, sign, split image, squint, storyboard, tiling, trimmed, unfocused, unattractive, unnatural pose, unreal engine, unsightly, written language',
  },
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    prompt:
      'bad anatomy, bad hands, three hands, three legs, bad arms, missing legs, missing arms, poorly drawn face, poorly rendered hands, bad face, fused face, cloned face, worst face, three crus, extra crus, fused crus, worst feet, three feet, fused feet, fused thigh, three thigh, extra thigh, worst thigh, missing fingers, extra fingers, ugly fingers, long fingers, bad composition, horn, extra eyes, huge eyes, 2girl, amputation, disconnected limbs, cartoon, cg, 3d, unreal, animate, cgi, render, artwork, illustration, 3d render, cinema 4d, artstation, octane render, mutated body parts, painting, oil painting, 2d, sketch, bad photography, bad photo, deviant art, aberrations, abstract, anime, black and white, collapsed, conjoined, creative, drawing, extra windows, harsh lighting, jpeg artifacts, low saturation, monochrome, multiple levels, overexposed, oversaturated, photoshop, rotten, surreal, twisted, UI, underexposed, unnatural, unreal engine, unrealistic, video game, deformed body features',
  },
  {
    id: 'anime',
    name: 'Anime',
    prompt:
      'bad anatomy, bad hands, three hands, three legs, bad arms, missing legs, missing arms, poorly drawn face, bad face, fused face, cloned face, worst face, out of frame double, three crus, extra crus, fused crus, worst feet, three feet, fused feet, fused thigh, three thigh, extra thigh, worst thigh, missing fingers, extra fingers, ugly fingers, long fingers, horn, realistic photo, extra eyes, huge eyes, 2girl, 2boy, amputation, disconnected limbs',
  },
];
