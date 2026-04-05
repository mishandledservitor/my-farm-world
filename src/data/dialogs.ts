export interface DialogLine {
  speaker: string;
  text: string;
}

export const NPC_DIALOGS: Record<string, DialogLine[]> = {
  mabel: [
    { speaker: 'Mabel', text: "Welcome to my shop, neighbor! I'll buy any crops or goods you have." },
    { speaker: 'Mabel', text: "I also stock the finest seeds in the valley. Let's see what we can do!" },
  ],
  finn: [
    { speaker: 'Finn', text: "Hey there, farmer! Settling in okay? This village is pretty friendly." },
    { speaker: 'Finn', text: "Rumor is there's a forest to the north of your farm. Maybe worth exploring someday..." },
    { speaker: 'Finn', text: "They say you need an axe though. Rosa might have one for sale." },
  ],
  finn_forest_locked: [
    { speaker: 'Finn', text: "I hear you've been eyeing that forest gate." },
    { speaker: 'Finn', text: "You'll need to be here at least a week and have an axe before it'll open." },
    { speaker: 'Finn', text: "Rosa sells axes — they're not cheap, but worth every coin." },
  ],
  finn_forest_open: [
    { speaker: 'Finn', text: "So you made it into the Whispering Forest! Beautiful, isn't it?" },
    { speaker: 'Finn', text: "The berries there are great for making jam in the oven." },
    { speaker: 'Finn', text: "Keep chopping — wood fetches a decent price." },
  ],
  finn_mine_locked: [
    { speaker: 'Finn', text: "See that cave entrance at the end of the road?" },
    { speaker: 'Finn', text: "The miners won't let anyone in until they've proven they can turn a profit." },
    { speaker: 'Finn', text: "Earn a thousand gold coins selling your goods and they'll let you through." },
  ],
  finn_mine_open: [
    { speaker: 'Finn', text: "The mine! I tried it once... came out with a pile of stone and sore arms." },
    { speaker: 'Finn', text: "Gold ore on the lower floors though — that stuff sells for a fortune." },
    { speaker: 'Finn', text: "Make sure you've got a pickaxe equipped before you swing." },
  ],
  rosa: [
    { speaker: 'Rosa', text: "Ah, a proper farmer! I can always spot one by the calluses." },
    { speaker: 'Rosa', text: "I keep axes for the forest, pickaxes for the mine, and scythes for faster harvesting." },
    { speaker: 'Rosa', text: "Take a look — good tools make all the difference out here." },
  ],
};

/**
 * Returns contextual Finn dialog lines based on the current save state.
 * Falls back to default finn dialog if no contextual variant matches.
 */
export function getFinnDialog(
  day: number,
  hasAxe: boolean,
  forestUnlocked: boolean,
  mineUnlocked: boolean,
): DialogLine[] {
  if (mineUnlocked) return NPC_DIALOGS.finn_mine_open;
  if (forestUnlocked) return NPC_DIALOGS.finn_forest_open;
  if (day >= 7 && !hasAxe) return NPC_DIALOGS.finn_forest_locked;
  if (day >= 15) return NPC_DIALOGS.finn_mine_locked;
  return NPC_DIALOGS.finn;
}

// NPCs that open a shop panel after their dialog ends
export const NPC_HAS_SHOP = new Set<string>(['mabel', 'rosa']);

// Items each shop NPC sells (must have buyPrice > 0 in items.ts)
export const NPC_SHOP_STOCK: Record<string, string[]> = {
  mabel: ['turnip_seed', 'carrot_seed', 'wheat_seed', 'pumpkin_seed', 'strawberry_seed', 'cow'],
  rosa:  ['axe', 'pickaxe', 'scythe'],
};
