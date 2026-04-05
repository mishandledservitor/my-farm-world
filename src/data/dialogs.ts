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
  rosa: [
    { speaker: 'Rosa', text: "Ah, a proper farmer! I can always spot one by the calluses." },
    { speaker: 'Rosa', text: "I keep axes for the forest, pickaxes for the mine, and scythes for faster harvesting." },
    { speaker: 'Rosa', text: "Take a look — good tools make all the difference out here." },
  ],
};

// NPCs that open a shop panel after their dialog ends
export const NPC_HAS_SHOP = new Set<string>(['mabel', 'rosa']);

// Items each shop NPC sells (must have buyPrice > 0 in items.ts)
export const NPC_SHOP_STOCK: Record<string, string[]> = {
  mabel: ['turnip_seed', 'carrot_seed', 'wheat_seed', 'pumpkin_seed', 'strawberry_seed'],
  rosa:  ['axe', 'pickaxe', 'scythe'],
};
